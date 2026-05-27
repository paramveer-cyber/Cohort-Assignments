import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../trpc";
import * as formsService from "@repo/services/forms";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Responses"];
const getPath = generatePath("/responses");

const responseOutput = z.object({
  id: z.string(),
  formId: z.string(),
  answers: z.unknown(),
  respondentEmail: z.string().nullable(),
  ipAddress: z.string().nullable(),
  submittedAt: z.date().nullable(),
});

export const responsesRouter = router({
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/{formId}"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .output(z.array(responseOutput))
    .query(async ({ ctx, input }) => {
      const responses = await formsService.getResponses(
        input.formId,
        ctx.currentUser.id,
        input.limit,
        input.offset,
      );
      if (!responses) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return responses;
    }),

  deleteOne: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/{responseId}/one"), tags: TAGS } })
    .input(z.object({ responseId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const ok = await formsService.deleteResponse(input.responseId, ctx.currentUser.id);
      if (!ok) throw new TRPCError({ code: "NOT_FOUND", message: "Response not found" });
      return { success: true };
    }),

  deleteAll: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/{formId}/all"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const ok = await formsService.deleteAllResponses(input.formId, ctx.currentUser.id);
      if (!ok) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return { success: true };
    }),
});
