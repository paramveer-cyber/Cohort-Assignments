import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { formsService } from "@repo/services/forms";
import { generatePath } from "../../utils/path-generator";
import {
  fieldInput,
  formOutput as formOutputSchema,
  formWithFieldsOutput,
  themeOutput,
  templateWithFieldsOutput,
  slimFieldOutput,
  fieldOutput as fieldOutputSchema,
} from "@repo/services/forms/model";
import type { FieldOutput } from "@repo/services/forms/model";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formsRouter = router({
  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/"), tags: TAGS } })
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().optional(),
      }),
    )
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formsService.createForm({
        creatorId: ctx.currentUser.id,
        title: input.title,
        description: input.description,
      });
      return formOutputSchema.parse(form);
    }),

  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/"), tags: TAGS } })
    .input(z.undefined())
    .output(z.array(formOutputSchema))
    .query(async ({ ctx }) => {
      const forms = await formsService.listFormsByCreator(ctx.currentUser.id);
      return forms.map((f) => formOutputSchema.parse(f));
    }),

  get: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/{formId}"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(formWithFieldsOutput)
    .query(async ({ ctx, input }) => {
      const form = await formsService.getFormWithFields(input.formId);
      if (!form || form.creatorId !== ctx.currentUser.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return formWithFieldsOutput.parse(form);
    }),

  update: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("/{formId}"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        slug: z
          .string()
          .min(3)
          .max(180)
          .regex(/^[a-z0-9-]+$/)
          .optional(),
        successMessage: z.string().optional(),
        closedMessage: z.string().optional(),
        allowMultipleSubmissions: z.boolean().optional(),
        collectEmail: z.boolean().optional(),
        themeId: z.string().uuid().optional(),
        password: z.string().optional().nullable(),
        expiresAt: z.string().datetime().optional().nullable(),
        responseLimit: z.number().int().min(1).optional().nullable(),
      }),
    )
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { formId, expiresAt, ...rest } = input;
      const data = {
        ...rest,
        expiresAt: expiresAt ? new Date(expiresAt) : expiresAt === null ? null : undefined,
      };
      const form = await formsService.updateForm({
        ...data,
        formId,
        creatorId: ctx.currentUser.id,
      });
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return formOutputSchema.parse(form);
    }),

  updateFields: protectedProcedure
    .meta({ openapi: { method: "PUT", path: getPath("/{formId}/fields"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid(),
        fields: z.array(fieldInput),
      }),
    )
    .output(z.array(slimFieldOutput))
    .mutation(async ({ ctx, input }) => {
      const form = await formsService.getFormById(input.formId);
      if (!form || form.creatorId !== ctx.currentUser.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      const updated = await formsService.updateFields({
        formId: input.formId,
        creatorId: ctx.currentUser.id,
        fields: input.fields,
      });
      if (!updated)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update fields" });
      return updated.map((r) =>
        slimFieldOutput.parse({
          id: r.id,
          label: r.label,
          fieldType: r.fieldType,
          required: r.required,
          orderIndex: r.orderIndex,
          config: r.config ?? null,
        }),
      );
    }),

  publish: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{formId}/publish"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid(),
        visibility: z.enum(["public", "unlisted"]),
      }),
    )
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formsService.publishForm({
        formId: input.formId,
        creatorId: ctx.currentUser.id,
        visibility: input.visibility,
      });
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return formOutputSchema.parse(form);
    }),

  unpublish: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{formId}/unpublish"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formsService.unpublishForm(input.formId, ctx.currentUser.id);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return formOutputSchema.parse(form);
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/{formId}"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await formsService.deleteForm(input.formId, ctx.currentUser.id);
      return { success: true };
    }),

  clone: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{formId}/clone"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formsService.cloneForm(input.formId, ctx.currentUser.id);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return formOutputSchema.parse(form);
    }),

  cloneTemplate: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{formId}/clone-template"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const template = await formsService.getFormById(input.formId);
      if (!template || !template.isTemplate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }
      const form = await formsService.cloneForm(input.formId, ctx.currentUser.id, true);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Clone failed" });
      return formOutputSchema.parse(form);
    }),

  archive: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{formId}/archive"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formsService.archiveForm(input.formId, ctx.currentUser.id);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return formOutputSchema.parse(form);
    }),

  listThemes: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/themes/list"), tags: TAGS } })
    .input(z.undefined())
    .output(z.array(themeOutput))
    .query(async () => formsService.listThemes()),

  listTemplates: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/templates/list"), tags: TAGS } })
    .input(z.undefined())
    .output(z.array(templateWithFieldsOutput))
    .query(async () => {
      const templates = await formsService.listTemplates();
      return Promise.all(
        templates.map(async (t) => {
          const withFields = await formsService.getFormWithFields(t.id);
          const base = withFields ?? t;
          const fields = (withFields?.fields ?? []).map((f: FieldOutput) => ({
            id: f.id,
            label: f.label,
            fieldType: f.fieldType,
            required: f.required,
            orderIndex: f.orderIndex,
            config: f.config ?? null,
          }));
          return templateWithFieldsOutput.parse({ ...base, fields });
        }),
      );
    }),
});
