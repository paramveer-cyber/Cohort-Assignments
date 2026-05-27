import { db } from "@repo/database";
import {
  formsTable,
  formFieldsTable,
  formResponsesTable,
  themesTable,
} from "@repo/database/schema";
import { eq, and, desc, asc, sql, ne } from "@repo/database";
import { sendNewResponseNotification, sendRespondentConfirmation } from "../email";
import { isEmailEnabled, getUserById, adminListUsers as adminListUsersFromUser } from "../user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../env";
import type {
  CreateFormInput,
  UpdateFormInput,
  UpdateFieldsInput,
  PublishFormInput,
  CloneTemplateInput,
  SubmitResponseInput,
} from "./model";

class FormsService {
  private buildSlug(title: string) {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now().toString(36)
    );
  }

  private buildCloneSlug(sourceSlug: string) {
    return sourceSlug.replace(/-[a-z0-9]+$/, "") + "-copy-" + Date.now().toString(36);
  }

  private toFormRow(raw: Record<string, unknown>) {
    return { ...raw, isPasswordProtected: !!raw.passwordHash };
  }

  private async checkOwnership(formId: string, creatorId: string) {
    const form = await this.getFormById(formId);
    if (!form || form.creatorId !== creatorId) return null;
    return form;
  }

  private async checkSlugConflict(slug: string, excludeFormId: string) {
    const conflict = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(eq(formsTable.slug, slug), ne(formsTable.id, excludeFormId)))
      .limit(1);
    if (conflict.length > 0) throw new Error("Slug already taken");
  }

  private signUnlockToken(formId: string) {
    return jwt.sign({ formId, type: "form_unlock" }, env.JWT_SECRET, { expiresIn: "1h" });
  }

  private verifyUnlockToken(token: string, formId: string): boolean {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { formId: string; type: string };
      return payload.type === "form_unlock" && payload.formId === formId;
    } catch {
      return false;
    }
  }

  private async fireResponseEmails(
    formId: string,
    respondentEmail: string | undefined,
    updatedResponseCount: number,
    formTitle: string,
    creatorId: string,
    successMessage: string | null,
  ) {
    const creator = await getUserById(creatorId);
    if (creator) {
      isEmailEnabled(creatorId, "new_response")
        .then((enabled) => {
          if (!enabled) return;
          return sendNewResponseNotification(creator.email, formTitle, updatedResponseCount);
        })
        .catch((err: unknown) =>
          console.error("[EMAIL ERROR] sendNewResponseNotification failed:", err),
        );
    }
    if (respondentEmail && successMessage) {
      sendRespondentConfirmation(respondentEmail, formTitle, successMessage).catch((err: unknown) =>
        console.error("[EMAIL ERROR] sendRespondentConfirmation failed:", err),
      );
    }
  }

  async getFormById(formId: string) {
    const [form] = await db.select().from(formsTable).where(eq(formsTable.id, formId)).limit(1);
    return form ?? null;
  }

  async getFormBySlug(slug: string) {
    const [form] = await db.select().from(formsTable).where(eq(formsTable.slug, slug)).limit(1);
    return form ?? null;
  }

  async getFormWithFields(formId: string) {
    const form = await this.getFormById(formId);
    if (!form) return null;
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.orderIndex));
    return { ...form, fields };
  }

  async getFormBySlugWithFields(slug: string) {
    const form = await this.getFormBySlug(slug);
    if (!form) return null;
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, form.id))
      .orderBy(asc(formFieldsTable.orderIndex));
    return { ...form, fields };
  }

  async createForm({ creatorId, title, description }: CreateFormInput) {
    const slug = this.buildSlug(title);
    const [form] = await db
      .insert(formsTable)
      .values({ creatorId, title, slug, description: description ?? null, status: "draft" })
      .returning();
    return this.toFormRow(form as unknown as Record<string, unknown>);
  }

  async listFormsByCreator(creatorId: string) {
    const forms = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.creatorId, creatorId))
      .orderBy(desc(formsTable.createdAt));
    return forms.map((f) => this.toFormRow(f as unknown as Record<string, unknown>));
  }

  async listPublicForms(limit = 20, offset = 0) {
    return db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        slug: formsTable.slug,
        description: formsTable.description,
        responseCount: formsTable.responseCount,
        createdAt: formsTable.createdAt,
      })
      .from(formsTable)
      .where(and(eq(formsTable.status, "published"), eq(formsTable.visibility, "public")))
      .orderBy(desc(formsTable.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  async listTemplates() {
    return db
      .select()
      .from(formsTable)
      .where(eq(formsTable.isTemplate, true))
      .orderBy(asc(formsTable.title));
  }

  async listThemes() {
    return db.select().from(themesTable).orderBy(asc(themesTable.name));
  }

  async updateForm({ formId, creatorId, password, ...rest }: UpdateFormInput) {
    const owned = await this.checkOwnership(formId, creatorId);
    if (!owned) return null;

    const patch: Record<string, unknown> = { ...rest, updatedAt: new Date() };

    if (password !== undefined) {
      patch.passwordHash =
        password === null || password === "" ? null : await bcrypt.hash(password, 12);
    }

    if (rest.slug !== undefined) {
      await this.checkSlugConflict(rest.slug, formId);
    }

    const [form] = await db
      .update(formsTable)
      .set(patch)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();
    return form ? this.toFormRow(form as unknown as Record<string, unknown>) : null;
  }

  async updateFields({ formId, creatorId, fields }: UpdateFieldsInput) {
    const owned = await this.checkOwnership(formId, creatorId);
    if (!owned) return null;

    await db.delete(formFieldsTable).where(eq(formFieldsTable.formId, formId));
    if (fields.length === 0) return [];

    return db
      .insert(formFieldsTable)
      .values(
        fields.map((f) => ({
          formId,
          label: f.label,
          description: f.description ?? null,
          fieldType: f.fieldType,
          placeholder: f.placeholder ?? null,
          required: f.required,
          orderIndex: f.orderIndex,
          validationRules: f.validationRules ?? null,
          config: f.config ?? null,
        })),
      )
      .returning();
  }

  async publishForm({ formId, creatorId, visibility }: PublishFormInput) {
    const [form] = await db
      .update(formsTable)
      .set({ status: "published", visibility, publishedAt: new Date(), unpublishedAt: null })
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();
    return form ? this.toFormRow(form as unknown as Record<string, unknown>) : null;
  }

  async unpublishForm(formId: string, creatorId: string) {
    const [form] = await db
      .update(formsTable)
      .set({ status: "draft", unpublishedAt: new Date() })
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();
    return form ? this.toFormRow(form as unknown as Record<string, unknown>) : null;
  }

  async archiveForm(formId: string, creatorId: string) {
    const [form] = await db
      .update(formsTable)
      .set({ status: "archived" })
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();
    return form ? this.toFormRow(form as unknown as Record<string, unknown>) : null;
  }

  async deleteForm(formId: string, creatorId: string) {
    await db
      .delete(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)));
  }

  async cloneForm(formId: string, creatorId: string, allowAnyCreator = false) {
    const source = await this.getFormWithFields(formId);
    if (!source) return null;
    if (!allowAnyCreator && source.creatorId !== creatorId) return null;

    const [newForm] = await db
      .insert(formsTable)
      .values({
        creatorId,
        title: `${source.title} (Copy)`,
        slug: this.buildCloneSlug(source.slug),
        description: source.description,
        status: "draft",
        themeId: source.themeId,
        successMessage: source.successMessage,
        closedMessage: source.closedMessage,
        allowMultipleSubmissions: source.allowMultipleSubmissions,
        collectEmail: source.collectEmail,
        requiresLogin: source.requiresLogin,
      })
      .returning();

    if (!newForm) return null;

    if (source.fields.length > 0) {
      await db.insert(formFieldsTable).values(
        source.fields.map((f) => ({
          formId: newForm.id,
          label: f.label,
          description: f.description,
          fieldType: f.fieldType,
          placeholder: f.placeholder,
          required: f.required,
          orderIndex: f.orderIndex,
          validationRules: f.validationRules,
          config: f.config,
        })),
      );
    }

    return this.toFormRow(newForm as unknown as Record<string, unknown>);
  }

  async cloneTemplate({ formId, creatorId }: CloneTemplateInput) {
    const template = await this.getFormById(formId);
    if (!template || !template.isTemplate) return null;
    return this.cloneForm(formId, creatorId, true);
  }

  async unlockForm(slug: string, password: string) {
    const form = await this.getFormBySlug(slug);
    if (!form || !form.passwordHash) return null;
    const valid = await bcrypt.compare(password, form.passwordHash);
    if (!valid) return null;
    return this.signUnlockToken(form.id);
  }

  verifyFormUnlockToken(token: string, formId: string) {
    return this.verifyUnlockToken(token, formId);
  }

  isFormClosed(form: {
    expiresAt: Date | null;
    responseLimit: number | null;
    responseCount: number | null;
    status: string;
  }) {
    if (form.status !== "published") return { closed: true, reason: "not_published" as const };
    if (form.expiresAt && new Date() > form.expiresAt)
      return { closed: true, reason: "expired" as const };
    if (form.responseLimit !== null && (form.responseCount ?? 0) >= form.responseLimit)
      return { closed: true, reason: "limit_reached" as const };
    return { closed: false, reason: null };
  }

  async submitResponse({
    slug,
    answers,
    respondentEmail,
    unlockToken,
    ipAddress,
    userAgent,
  }: SubmitResponseInput) {
    const form = await this.getFormBySlugWithFields(slug);
    if (!form) return { error: "NOT_FOUND" as const };

    const closedState = this.isFormClosed(form);
    if (closedState.closed) {
      return {
        error: "FORM_CLOSED" as const,
        closedMessage: form.closedMessage ?? "This form is no longer accepting responses.",
      };
    }

    if (form.passwordHash) {
      if (!unlockToken || !this.verifyUnlockToken(unlockToken, form.id)) {
        return { error: "INVALID_TOKEN" as const };
      }
    }

    for (const field of form.fields) {
      if (field.required && field.fieldType !== "page_break") {
        const answer = answers[field.id];
        const isEmpty =
          answer === undefined ||
          answer === null ||
          answer === "" ||
          (Array.isArray(answer) && answer.length === 0);
        if (isEmpty) return { error: "REQUIRED_FIELD" as const, fieldLabel: field.label };
      }
    }

    const [response] = await db
      .insert(formResponsesTable)
      .values({
        formId: form.id,
        answers,
        respondentEmail: respondentEmail ?? null,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
      })
      .returning();

    const [updated] = await db
      .update(formsTable)
      .set({ responseCount: sql`${formsTable.responseCount} + 1`, lastResponseAt: new Date() })
      .where(eq(formsTable.id, form.id))
      .returning({
        responseCount: formsTable.responseCount,
        title: formsTable.title,
        creatorId: formsTable.creatorId,
        successMessage: formsTable.successMessage,
      });

    if (updated) {
      await this.fireResponseEmails(
        form.id,
        respondentEmail,
        updated.responseCount ?? 1,
        updated.title,
        updated.creatorId,
        updated.successMessage,
      );
    }

    return {
      error: null,
      response: response!,
      successMessage: form.successMessage ?? "Thank you for your response!",
    };
  }

  async incrementViewCount(formId: string) {
    await db
      .update(formsTable)
      .set({ viewCount: sql`${formsTable.viewCount} + 1` })
      .where(eq(formsTable.id, formId));
  }

  async getResponses(formId: string, creatorId: string, limit?: number, offset?: number) {
    const owned = await this.checkOwnership(formId, creatorId);
    if (!owned) return null;

    const query = db
      .select()
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId))
      .orderBy(desc(formResponsesTable.submittedAt));

    if (limit !== undefined && offset !== undefined) {
      return query.limit(limit).offset(offset);
    }
    return query;
  }

  async deleteResponse(responseId: string, creatorId: string) {
    const [response] = await db
      .select({ id: formResponsesTable.id, formId: formResponsesTable.formId })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.id, responseId))
      .limit(1);
    if (!response) return false;

    const owned = await this.checkOwnership(response.formId, creatorId);
    if (!owned) return false;

    await db.delete(formResponsesTable).where(eq(formResponsesTable.id, responseId));
    await db
      .update(formsTable)
      .set({ responseCount: sql`GREATEST(${formsTable.responseCount} - 1, 0)` })
      .where(eq(formsTable.id, response.formId));
    return true;
  }

  async deleteAllResponses(formId: string, creatorId: string) {
    const owned = await this.checkOwnership(formId, creatorId);
    if (!owned) return false;

    await db.delete(formResponsesTable).where(eq(formResponsesTable.formId, formId));
    await db
      .update(formsTable)
      .set({ responseCount: 0, lastResponseAt: null })
      .where(eq(formsTable.id, formId));
    return true;
  }

  async adminListForms() {
    return db.select().from(formsTable).orderBy(desc(formsTable.createdAt));
  }

  // Backwards-compat shim: some callers mistakenly call `formsService.adminListUsers()`.
  // Provide a thin proxy to the user service so those calls type-check and continue to work.
  async adminListUsers() {
    return adminListUsersFromUser();
  }

  async adminDeleteForm(formId: string) {
    await db.delete(formsTable).where(eq(formsTable.id, formId));
  }

  async adminSetTemplate(formId: string, isTemplate: boolean) {
    const [form] = await db
      .update(formsTable)
      .set({ isTemplate })
      .where(eq(formsTable.id, formId))
      .returning();
    return form ? this.toFormRow(form as unknown as Record<string, unknown>) : null;
  }
}

export const formsService = new FormsService();

// Export common instance methods as named functions for backwards compatibility
export async function getResponses(
  formId: string,
  creatorId: string,
  limit?: number,
  offset?: number,
) {
  return formsService.getResponses(formId, creatorId, limit, offset);
}

export async function adminListForms() {
  return formsService.adminListForms();
}

export async function adminDeleteForm(formId: string) {
  return formsService.adminDeleteForm(formId);
}

export async function adminSetTemplate(formId: string, isTemplate: boolean) {
  return formsService.adminSetTemplate(formId, isTemplate);
}

export async function adminListUsers() {
  return formsService.adminListUsers();
}

export async function listPublicForms(limit = 20, offset = 0) {
  return formsService.listPublicForms(limit, offset);
}

export async function getFormBySlugWithFields(slug: string) {
  return formsService.getFormBySlugWithFields(slug);
}

export async function getFormWithFields(formId: string) {
  return formsService.getFormWithFields(formId);
}

export async function getFormById(formId: string) {
  return formsService.getFormById(formId);
}

export async function getFormBySlug(slug: string) {
  return formsService.getFormBySlug(slug);
}

export async function createForm(input: CreateFormInput) {
  return formsService.createForm(input);
}

export async function listFormsByCreator(creatorId: string) {
  return formsService.listFormsByCreator(creatorId);
}

export async function listTemplates() {
  return formsService.listTemplates();
}

export async function listThemes() {
  return formsService.listThemes();
}

export async function updateForm(input: UpdateFormInput) {
  return formsService.updateForm(input);
}

export async function updateFields(input: UpdateFieldsInput) {
  return formsService.updateFields(input);
}

export async function publishForm(input: PublishFormInput) {
  return formsService.publishForm(input);
}

export async function unpublishForm(formId: string, creatorId: string) {
  return formsService.unpublishForm(formId, creatorId);
}

export async function archiveForm(formId: string, creatorId: string) {
  return formsService.archiveForm(formId, creatorId);
}

export async function deleteForm(formId: string, creatorId: string) {
  return formsService.deleteForm(formId, creatorId);
}

export async function cloneForm(formId: string, creatorId: string, allowAnyCreator = false) {
  return formsService.cloneForm(formId, creatorId, allowAnyCreator);
}

export async function cloneTemplate(input: CloneTemplateInput) {
  return formsService.cloneTemplate(input);
}

export async function unlockForm(slug: string, password: string) {
  return formsService.unlockForm(slug, password);
}

export function verifyFormUnlockToken(token: string, formId: string) {
  return formsService.verifyFormUnlockToken(token, formId);
}

export function isFormClosed(form: {
  expiresAt: Date | null;
  responseLimit: number | null;
  responseCount: number | null;
  status: string;
}) {
  return formsService.isFormClosed(form);
}

export async function submitResponse(
  slug: string,
  answers: Record<string, unknown>,
  respondentEmail?: string | undefined,
  ipAddress?: string | undefined,
  userAgent?: string | undefined,
) {
  return formsService.submitResponse({
    slug,
    answers,
    respondentEmail,
    unlockToken: undefined,
    ipAddress,
    userAgent,
  } as SubmitResponseInput);
}

export async function deleteResponse(responseId: string, creatorId: string) {
  return formsService.deleteResponse(responseId, creatorId);
}

export async function deleteAllResponses(formId: string, creatorId: string) {
  return formsService.deleteAllResponses(formId, creatorId);
}

export async function incrementViewCount(formId: string) {
  return formsService.incrementViewCount(formId);
}
