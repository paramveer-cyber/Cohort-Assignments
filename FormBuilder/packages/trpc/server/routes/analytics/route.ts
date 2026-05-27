import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../trpc";
import { getFormAnalytics, getDashboardStats, getUserProfileStats } from "@repo/services/analytics";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Analytics"];
const getPath = generatePath("/analytics");

export const analyticsRouter = router({
  dashboard: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/dashboard"), tags: TAGS } })
    .input(z.undefined())
    .output(z.object({
      totalForms: z.number(),
      publishedForms: z.number(),
      totalResponses: z.number(),
      totalViews: z.number(),
      forms: z.array(z.object({
        id: z.string(),
        title: z.string(),
        status: z.string(),
        responseCount: z.number().nullable(),
        viewCount: z.number().nullable(),
        createdAt: z.date().nullable(),
      })),
    }))
    .query(async ({ ctx }) => {
      return getDashboardStats(ctx.currentUser.id);
    }),

  userProfile: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/profile"), tags: TAGS } })
    .input(z.undefined())
    .output(z.object({
      totalForms: z.number(),
      publishedForms: z.number(),
      totalResponses: z.number(),
      totalViews: z.number(),
      avgResponseRate: z.number(),
      recentActivity: z.array(z.object({
        formId: z.string(),
        formTitle: z.string(),
        responseCount: z.number(),
        lastResponseAt: z.date().nullable(),
      })),
      responsesByDay: z.array(z.object({ date: z.string(), count: z.number() })),
    }))
    .query(async ({ ctx }) => {
      return getUserProfileStats(ctx.currentUser.id);
    }),

  formStats: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/forms/{formId}"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.object({
      formId: z.string(),
      title: z.string(),
      status: z.string(),
      visibility: z.string().nullable(),
      totalResponses: z.number(),
      viewCount: z.number(),
      last7Days: z.number(),
      last30Days: z.number(),
      lastResponseAt: z.date().nullable(),
      dailyData: z.array(z.object({ date: z.string(), count: z.number() })),
      fieldBreakdown: z.array(z.object({
        fieldId: z.string(),
        label: z.string(),
        fieldType: z.string(),
        answered: z.number(),
        completionRate: z.number(),
        valueBreakdown: z.array(z.object({ value: z.string(), count: z.number() })),
      })),
    }))
    .query(async ({ ctx, input }) => {
      const stats = await getFormAnalytics(input.formId, ctx.currentUser.id);
      if (!stats) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return stats;
    }),

  responses: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/forms/{formId}/responses"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.array(z.object({
      id: z.string(),
      respondentEmail: z.string().nullable(),
      answers: z.unknown(),
      submittedAt: z.date().nullable(),
    })))
    .query(async ({ ctx, input }) => {
      const { getResponses } = await import("@repo/services/forms");
      const responses = await getResponses(input.formId, ctx.currentUser.id);
      if (!responses) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return responses;
    }),
});
