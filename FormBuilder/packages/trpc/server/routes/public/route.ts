import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import * as formsService from "@repo/services/forms";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Public"];
const getPath = generatePath("/public");

const publicFormOutput = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  successMessage: z.string().nullable(),
  closedMessage: z.string().nullable(),
  collectEmail: z.boolean().nullable(),
  isPasswordProtected: z.boolean(),
  isClosed: z.boolean(),
  closedReason: z.string().nullable(),
  fields: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      description: z.string().nullable(),
      fieldType: z.string(),
      placeholder: z.string().nullable(),
      required: z.boolean().nullable(),
      orderIndex: z.number(),
      validationRules: z.unknown().nullable(),
      config: z.unknown().nullable(),
    }),
  ),
  themeId: z.string().nullable(),
});

export const publicRouter = router({
  exploreForms: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/explore"), tags: TAGS } })
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .output(
      z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          slug: z.string(),
          description: z.string().nullable(),
          responseCount: z.number().nullable(),
          createdAt: z.date().nullable(),
        }),
      ),
    )
    .query(async ({ input }) => {
      return formsService.listPublicForms(input.limit, input.offset);
    }),

  getForm: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/forms/{slug}"), tags: TAGS } })
    .input(z.object({ slug: z.string().min(1) }))
    .output(publicFormOutput)
    .query(async ({ input }) => {
      const form = await formsService.getFormBySlugWithFields(input.slug);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      if (form.status !== "published")
        throw new TRPCError({ code: "NOT_FOUND", message: "Form is not published" });

      await formsService.incrementViewCount(form.id);

      const closedState = formsService.isFormClosed(form);

      return {
        id: form.id,
        title: form.title,
        slug: form.slug,
        description: form.description,
        successMessage: form.successMessage,
        closedMessage: form.closedMessage,
        collectEmail: form.collectEmail,
        isPasswordProtected: !!form.passwordHash,
        isClosed: closedState.closed,
        closedReason: closedState.reason,
        fields: closedState.closed ? [] : form.fields,
        themeId: form.themeId ?? null,
      };
    }),

  unlockForm: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/forms/{slug}/unlock"), tags: TAGS } })
    .input(z.object({ slug: z.string().min(1), password: z.string().min(1) }))
    .output(z.object({ unlockToken: z.string() }))
    .mutation(async ({ input }) => {
      const token = await formsService.unlockForm(input.slug, input.password);
      if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect password" });
      return { unlockToken: token };
    }),

  submitForm: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/forms/{slug}/submit"), tags: TAGS } })
    .input(
      z.object({
        slug: z.string().min(1),
        answers: z.record(z.string(), z.unknown()),
        respondentEmail: z.string().email().optional(),
        unlockToken: z.string().optional(),
      }),
    )
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const form = await formsService.getFormBySlugWithFields(input.slug);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });

      const closedState = formsService.isFormClosed(form);
      if (closedState.closed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: form.closedMessage ?? "This form is no longer accepting responses.",
        });
      }

      if (form.passwordHash) {
        if (!input.unlockToken || !formsService.verifyFormUnlockToken(input.unlockToken, form.id)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired unlock token" });
        }
      }

      for (const field of form.fields) {
        if (field.required && field.fieldType !== "page_break") {
          const answer = input.answers[field.id];
          const isEmpty =
            answer === undefined ||
            answer === null ||
            answer === "" ||
            (Array.isArray(answer) && answer.length === 0);
          if (isEmpty) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Field "${field.label}" is required`,
            });
          }
        }
      }

      const ipAddress =
        (ctx.req.headers["x-forwarded-for"] as string | undefined) ??
        ctx.req.socket.remoteAddress ??
        undefined;
      const userAgent = ctx.req.headers["user-agent"] as string | undefined;

      await formsService.submitResponse(
        form.id,
        input.answers,
        input.respondentEmail,
        ipAddress,
        userAgent,
      );

      return {
        success: true,
        message: form.successMessage ?? "Thank you for your response!",
      };
    }),
});
