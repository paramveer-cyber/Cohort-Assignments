import { z } from "zod";
import { protectedProcedure, router } from "../../trpc";
import { getEmailPreferences, updateEmailPreferences, EMAIL_TYPES } from "@repo/services/user";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["User"];
const getPath = generatePath("/user");

const emailPrefsOutput = z.object({
  new_response: z.boolean(),
  password_reset: z.boolean(),
  account_deletion: z.boolean(),
});

export const userRouter = router({
  getEmailPreferences: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/email-preferences"), tags: TAGS } })
    .input(z.undefined())
    .output(emailPrefsOutput)
    .query(async ({ ctx }) => {
      return getEmailPreferences(ctx.currentUser.id);
    }),

  updateEmailPreferences: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("/email-preferences"), tags: TAGS } })
    .input(z.object({
      new_response: z.boolean().optional(),
      password_reset: z.boolean().optional(),
      account_deletion: z.boolean().optional(),
    }))
    .output(emailPrefsOutput)
    .mutation(async ({ ctx, input }) => {
      return updateEmailPreferences(ctx.currentUser.id, input);
    }),
});
