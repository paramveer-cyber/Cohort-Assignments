import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import {
  registerUser,
  loginUser,
  findOrCreateGoogleUser,
  verifyRefreshToken,
  forgotPassword,
  resetPassword,
  softDeleteAccount,
  purgeExpiredDeletedAccounts,
  createTokenIssuer,
  createCookieClearer,
} from "@repo/services/auth";
import { getUserById } from "@repo/services/user";
import { getRefreshTokenCookie } from "@repo/services/utils/cookies";
import {
  registerInput,
  loginInput,
  googleLoginInput,
  forgotPasswordInput,
  resetPasswordInput,
  purgeDeletedAccountsInput,
  authOutput,
  meOutput,
} from "@repo/services/auth/model";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Authentication"];
const getPath = generatePath("/auth");

export const authRouter = router({
  register: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/register"), tags: TAGS } })
    .input(registerInput)
    .output(authOutput)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await registerUser(input.name, input.email, input.password);
        const issueTokens = createTokenIssuer(ctx.res);
        const accessToken = issueTokens(user.id);
        return {
          accessToken,
          user: { id: user.id, name: user.name, email: user.email, role: user.role ?? null },
        };
      } catch (err: unknown) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err instanceof Error ? err.message : "Registration failed",
        });
      }
    }),

  login: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/login"), tags: TAGS } })
    .input(loginInput)
    .output(authOutput)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await loginUser(input.email, input.password);
        const issueTokens = createTokenIssuer(ctx.res);
        const accessToken = issueTokens(user.id);
        return {
          accessToken,
          user: { id: user.id, name: user.name, email: user.email, role: user.role ?? null },
        };
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "ACCOUNT_SCHEDULED_FOR_DELETION") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This account is scheduled for deletion. Check your email to recover it.",
          });
        }
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
    }),

  googleLogin: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/google"), tags: TAGS } })
    .input(googleLoginInput)
    .output(authOutput)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await findOrCreateGoogleUser(input.idToken);
        const issueTokens = createTokenIssuer(ctx.res);
        const accessToken = issueTokens(user.id);
        return {
          accessToken,
          user: { id: user.id, name: user.name, email: user.email, role: user.role ?? null },
        };
      } catch (err: unknown) {
        if (err instanceof TRPCError) throw err;
        if (err instanceof Error && err.message === "ACCOUNT_SCHEDULED_FOR_DELETION") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This account is scheduled for deletion. Check your email to recover it.",
          });
        }
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: err instanceof Error ? err.message : "Google auth failed",
        });
      }
    }),

  refresh: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/refresh"), tags: TAGS } })
    .input(z.object({}))
    .output(authOutput)
    .mutation(async ({ ctx }) => {
      const refreshToken = getRefreshTokenCookie(ctx.req);
      if (!refreshToken) throw new TRPCError({ code: "UNAUTHORIZED", message: "No refresh token" });

      const payload = verifyRefreshToken(refreshToken);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid refresh token" });

      const user = await getUserById(payload.userId);
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });

      const issueTokens = createTokenIssuer(ctx.res);
      const accessToken = issueTokens(user.id);
      return {
        accessToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role ?? null },
      };
    }),

  logout: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/logout"), tags: TAGS } })
    .input(z.undefined())
    .output(z.object({ ok: z.boolean() }))
    .mutation(({ ctx }) => {
      const clearTokenCookie = createCookieClearer(ctx.res);
      clearTokenCookie();
      return { ok: true };
    }),

  me: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/me"), tags: TAGS } })
    .input(z.undefined())
    .output(meOutput)
    .query(({ ctx }) => {
      const u = ctx.currentUser;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl ?? null,
        role: u.role ?? null,
      };
    }),

  forgotPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/forgot-password"), tags: TAGS } })
    .input(forgotPasswordInput)
    .output(z.object({ ok: z.boolean() }))
    .mutation(async ({ input }) => {
      await forgotPassword(input.email);
      return { ok: true };
    }),

  resetPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/reset-password"), tags: TAGS } })
    .input(resetPasswordInput)
    .output(z.object({ ok: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        await resetPassword(input.token, input.password);
        return { ok: true };
      } catch (err: unknown) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err instanceof Error ? err.message : "Reset failed",
        });
      }
    }),

  deleteAccount: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/account"), tags: TAGS } })
    .input(z.object({}))
    .output(z.object({ ok: z.boolean() }))
    .mutation(async ({ ctx }) => {
      await softDeleteAccount(ctx.currentUser.id);
      const clearTokenCookie = createCookieClearer(ctx.res);
      clearTokenCookie();
      return { ok: true };
    }),
  // this would be called by a cron job, not exposed to the client
  purgeDeletedAccounts: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/purge-deleted"), tags: TAGS } })
    .input(purgeDeletedAccountsInput)
    .output(z.object({ purged: z.number() }))
    .mutation(async ({ input }) => {
      if (input.cronSecret !== process.env.CRON_SECRET) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid cron secret" });
      }
      const purged = await purgeExpiredDeletedAccounts();
      return { purged };
    }),
});
