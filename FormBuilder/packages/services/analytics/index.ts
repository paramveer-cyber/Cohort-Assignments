import { db } from "@repo/database";
import { formsTable, formFieldsTable, formResponsesTable } from "@repo/database/schema";
import { eq, and, gte, sql, desc } from "@repo/database";
import { formsService } from "../forms";

export async function getFormAnalytics(formId: string, creatorId: string) {
  const form = await formsService.getFormById(formId);
  if (!form || form.creatorId !== creatorId) return null;

  const responses = await db
    .select()
    .from(formResponsesTable)
    .where(eq(formResponsesTable.formId, formId))
    .orderBy(desc(formResponsesTable.submittedAt));

  const fields = await db.select().from(formFieldsTable).where(eq(formFieldsTable.formId, formId));

  const totalResponses = responses.length;
  const last7Days = responses.filter((r) => {
    const d = new Date(r.submittedAt!);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return d >= cutoff;
  }).length;

  const last30Days = responses.filter((r) => {
    const d = new Date(r.submittedAt!);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff;
  }).length;

  const dailyCounts: Record<string, number> = {};
  responses.forEach((r) => {
    const day = new Date(r.submittedAt!).toISOString().split("T")[0]!;
    dailyCounts[day] = (dailyCounts[day] ?? 0) + 1;
  });

  const dailyData = Object.entries(dailyCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  const fieldBreakdown = fields.map((field) => {
    const answers = responses
      .map((r) => {
        const ans = r.answers as Record<string, unknown>;
        return ans[field.id];
      })
      .filter((a) => a !== undefined && a !== null && a !== "");

    const answered = answers.length;
    const completionRate = totalResponses > 0 ? Math.round((answered / totalResponses) * 100) : 0;

    let valueBreakdown: Array<{ value: string; count: number }> = [];
    if (
      ["single_select", "multi_select", "dropdown", "checkbox", "rating"].includes(field.fieldType)
    ) {
      const counts: Record<string, number> = {};
      answers.forEach((a) => {
        if (Array.isArray(a)) {
          a.forEach((v) => {
            const key = String(v);
            counts[key] = (counts[key] ?? 0) + 1;
          });
        } else {
          const key = String(a);
          counts[key] = (counts[key] ?? 0) + 1;
        }
      });
      valueBreakdown = Object.entries(counts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
    }

    return {
      fieldId: field.id,
      label: field.label,
      fieldType: field.fieldType,
      answered,
      completionRate,
      valueBreakdown,
    };
  });

  return {
    formId,
    title: form.title,
    status: form.status,
    visibility: form.visibility,
    totalResponses,
    viewCount: form.viewCount ?? 0,
    last7Days,
    last30Days,
    lastResponseAt: form.lastResponseAt,
    dailyData,
    fieldBreakdown,
  };
}

export async function getUserProfileStats(creatorId: string) {
  const forms = await db
    .select({
      id: formsTable.id,
      title: formsTable.title,
      status: formsTable.status,
      responseCount: formsTable.responseCount,
      viewCount: formsTable.viewCount,
      lastResponseAt: formsTable.lastResponseAt,
    })
    .from(formsTable)
    .where(eq(formsTable.creatorId, creatorId));

  const totalForms = forms.length;
  const publishedForms = forms.filter((f) => f.status === "published").length;
  const totalResponses = forms.reduce((sum, f) => sum + (f.responseCount ?? 0), 0);
  const totalViews = forms.reduce((sum, f) => sum + (f.viewCount ?? 0), 0);
  const avgResponseRate = totalViews > 0 ? Math.round((totalResponses / totalViews) * 100) : 0;

  const recentActivity = forms
    .filter((f) => (f.responseCount ?? 0) > 0)
    .sort((a, b) => {
      const aTime = a.lastResponseAt ? new Date(a.lastResponseAt).getTime() : 0;
      const bTime = b.lastResponseAt ? new Date(b.lastResponseAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 5)
    .map((f) => ({
      formId: f.id,
      formTitle: f.title,
      responseCount: f.responseCount ?? 0,
      lastResponseAt: f.lastResponseAt ?? null,
    }));

  const formIds = forms.map((f) => f.id);
  let responsesByDay: Array<{ date: string; count: number }> = [];

  if (formIds.length > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const allResponses = await db
      .select({ submittedAt: formResponsesTable.submittedAt, formId: formResponsesTable.formId })
      .from(formResponsesTable)
      .where(gte(formResponsesTable.submittedAt, cutoff));

    const ownResponses = allResponses.filter((r) => formIds.includes(r.formId));

    const dailyCounts: Record<string, number> = {};
    ownResponses.forEach((r) => {
      const day = new Date(r.submittedAt!).toISOString().split("T")[0]!;
      dailyCounts[day] = (dailyCounts[day] ?? 0) + 1;
    });

    responsesByDay = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  return {
    totalForms,
    publishedForms,
    totalResponses,
    totalViews,
    avgResponseRate,
    recentActivity,
    responsesByDay,
  };
}

export async function getDashboardStats(creatorId: string) {
  const forms = await db
    .select({
      id: formsTable.id,
      title: formsTable.title,
      status: formsTable.status,
      responseCount: formsTable.responseCount,
      viewCount: formsTable.viewCount,
      createdAt: formsTable.createdAt,
    })
    .from(formsTable)
    .where(eq(formsTable.creatorId, creatorId));

  const totalForms = forms.length;
  const publishedForms = forms.filter((f) => f.status === "published").length;
  const totalResponses = forms.reduce((sum, f) => sum + (f.responseCount ?? 0), 0);
  const totalViews = forms.reduce((sum, f) => sum + (f.viewCount ?? 0), 0);

  return {
    totalForms,
    publishedForms,
    totalResponses,
    totalViews,
    forms,
  };
}
