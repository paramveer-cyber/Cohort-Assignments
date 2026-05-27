import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../trpc";
import { formsService } from "@repo/services/forms";
import { adminListUsers, adminDeleteUser } from "@repo/services/user";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Admin"];
const getPath = generatePath("/admin");

function requireAdmin(role: string | null | undefined) {
  if (role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
}

const userOutput = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string().nullable(),
  createdAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
});

const adminFormOutput = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  status: z.string(),
  creatorId: z.string(),
  responseCount: z.number().nullable(),
  isTemplate: z.boolean().nullable(),
  createdAt: z.date().nullable(),
});

export const adminRouter = router({
  stats: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/stats"), tags: TAGS } })
    .input(z.undefined())
    .output(
      z.object({
        totalUsers: z.number(),
        totalForms: z.number(),
        totalResponses: z.number(),
        publishedForms: z.number(),
      }),
    )
    .query(async ({ ctx }) => {
      requireAdmin(ctx.currentUser.role);
      const users = await adminListUsers();
      const forms = await formsService.adminListForms();
      const totalResponses = forms.reduce((sum, f) => sum + (f.responseCount ?? 0), 0);
      const publishedForms = forms.filter((f) => f.status === "published").length;
      return {
        totalUsers: users.length,
        totalForms: forms.length,
        totalResponses,
        publishedForms,
      };
    }),

  listUsers: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/users"), tags: TAGS } })
    .input(z.undefined())
    .output(z.array(userOutput))
    .query(async ({ ctx }) => {
      requireAdmin(ctx.currentUser.role);
      return adminListUsers();
    }),

  listForms: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/forms"), tags: TAGS } })
    .input(z.undefined())
    .output(z.array(adminFormOutput))
    .query(async ({ ctx }) => {
      requireAdmin(ctx.currentUser.role);
      return formsService.adminListForms();
    }),

  deleteUser: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/users/{userId}"), tags: TAGS } })
    .input(z.object({ userId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.currentUser.role);
      if (input.userId === ctx.currentUser.id)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot delete yourself" });
      await adminDeleteUser(input.userId);
      return { success: true };
    }),

  deleteForm: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/forms/{formId}"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.currentUser.role);
      await formsService.adminDeleteForm(input.formId);
      return { success: true };
    }),

  setTemplate: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("/forms/{formId}/template"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid(), isTemplate: z.boolean() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.currentUser.role);
      const form = await formsService.adminSetTemplate(input.formId, input.isTemplate);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return { success: true };
    }),
});
