import { z } from "zod";

export const fieldTypeEnum = z.enum([
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "dropdown",
  "rating",
  "date",
  "page_break",
]);
export type FieldType = z.infer<typeof fieldTypeEnum>;

export const fieldInput = z.object({
  label: z.string().min(1).max(255).describe("Visible label for this field"),
  description: z.string().optional().describe("Helper text shown below the label"),
  fieldType: fieldTypeEnum.describe("Type of input control"),
  placeholder: z.string().optional().describe("Placeholder text inside the input"),
  required: z.boolean().default(false).describe("Whether a response is required"),
  orderIndex: z.number().int().min(0).describe("Zero-based position among fields"),
  validationRules: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Field-specific validation config"),
  config: z.record(z.string(), z.unknown()).optional().describe("Field-specific display config"),
});
export type FieldInput = z.infer<typeof fieldInput>;

export const createFormInput = z.object({
  creatorId: z.string().uuid().describe("ID of the authenticated user creating the form"),
  title: z.string().min(1).max(200).describe("Form title shown to respondents"),
  description: z.string().optional().describe("Optional subtitle or instructions"),
});
export type CreateFormInput = z.infer<typeof createFormInput>;

export const updateFormInput = z.object({
  formId: z.string().uuid().describe("ID of the form to update"),
  creatorId: z.string().uuid().describe("Must match the form's creator"),
  title: z.string().min(1).max(200).optional().describe("New title"),
  description: z.string().optional().describe("New description"),
  slug: z
    .string()
    .min(3)
    .max(180)
    .regex(/^[a-z0-9-]+$/)
    .optional()
    .describe("URL-safe slug, lowercase alphanumeric and hyphens"),
  successMessage: z.string().optional().describe("Message shown after successful submission"),
  closedMessage: z.string().optional().describe("Message shown when form is closed"),
  allowMultipleSubmissions: z
    .boolean()
    .optional()
    .describe("Allow one respondent to submit more than once"),
  collectEmail: z.boolean().optional().describe("Prompt respondent for their email address"),
  themeId: z.string().uuid().optional().describe("ID of the visual theme to apply"),
  password: z
    .string()
    .optional()
    .nullable()
    .describe("Plain-text password; null removes protection"),
  expiresAt: z
    .date()
    .optional()
    .nullable()
    .describe("UTC datetime after which the form stops accepting responses"),
  responseLimit: z
    .number()
    .int()
    .min(1)
    .optional()
    .nullable()
    .describe("Max responses before auto-closing"),
});
export type UpdateFormInput = z.infer<typeof updateFormInput>;

export const updateFieldsInput = z.object({
  formId: z.string().uuid().describe("ID of the form whose fields are replaced"),
  creatorId: z.string().uuid().describe("Must match the form's creator"),
  fields: z.array(fieldInput).describe("Full replacement list of fields"),
});
export type UpdateFieldsInput = z.infer<typeof updateFieldsInput>;

export const publishFormInput = z.object({
  formId: z.string().uuid().describe("ID of the form to publish"),
  creatorId: z.string().uuid().describe("Must match the form's creator"),
  visibility: z
    .enum(["public", "unlisted"])
    .describe("public = listed on explore; unlisted = link-only"),
});
export type PublishFormInput = z.infer<typeof publishFormInput>;

export const cloneTemplateInput = z.object({
  formId: z.string().uuid().describe("ID of the template form to clone"),
  creatorId: z.string().uuid().describe("ID of the user who will own the clone"),
});
export type CloneTemplateInput = z.infer<typeof cloneTemplateInput>;

export const submitResponseInput = z.object({
  slug: z.string().min(1).describe("Public slug of the form being submitted"),
  answers: z.record(z.string(), z.unknown()).describe("Map of field ID → answer value"),
  respondentEmail: z
    .string()
    .email()
    .optional()
    .describe("Submitter's email if collectEmail is enabled"),
  unlockToken: z
    .string()
    .optional()
    .describe("Token from /unlock required when form is password-protected"),
  ipAddress: z.string().optional().describe("Submitter IP for spam/abuse tracking"),
  userAgent: z.string().optional().describe("Submitter browser UA for spam/abuse tracking"),
});
export type SubmitResponseInput = z.infer<typeof submitResponseInput>;

export const formOutput = z.object({
  id: z.string().describe("UUID of the form"),
  title: z.string().describe("Form title"),
  slug: z.string().describe("URL-safe identifier"),
  description: z.string().nullable().describe("Optional subtitle"),
  status: z.string().describe("draft | published | archived"),
  visibility: z.string().nullable().describe("public | unlisted"),
  responseCount: z.number().nullable().describe("Total submissions received"),
  viewCount: z.number().nullable().describe("Total times the public form was loaded"),
  createdAt: z.date().nullable().describe("Creation timestamp"),
  updatedAt: z.date().nullable().describe("Last modification timestamp"),
  publishedAt: z.date().nullable().describe("When the form was last published"),
  successMessage: z.string().nullable().describe("Message shown on successful submission"),
  closedMessage: z
    .string()
    .nullable()
    .describe("Message shown when form accepts no more responses"),
  allowMultipleSubmissions: z
    .boolean()
    .nullable()
    .describe("Whether repeat submissions are allowed"),
  collectEmail: z.boolean().nullable().describe("Whether respondent email is collected"),
  themeId: z.string().nullable().describe("Applied theme UUID"),
  isPasswordProtected: z.boolean().describe("True when a password hash is set"),
  expiresAt: z.date().nullable().describe("Expiry datetime"),
  responseLimit: z.number().nullable().describe("Max responses cap"),
  isTemplate: z.boolean().nullable().describe("Whether this form is a reusable template"),
});
export type FormOutput = z.infer<typeof formOutput>;

export const fieldOutput = z.object({
  id: z.string().describe("UUID of the field"),
  label: z.string().describe("Visible label"),
  description: z.string().nullable().describe("Helper text"),
  fieldType: z.string().describe("Input control type"),
  placeholder: z.string().nullable().describe("Placeholder text"),
  required: z.boolean().nullable().describe("Whether a response is required"),
  orderIndex: z.number().describe("Position among fields"),
  validationRules: z.unknown().nullable().describe("Validation config"),
  config: z.unknown().nullable().describe("Display config"),
});
export type FieldOutput = z.infer<typeof fieldOutput>;

export const formWithFieldsOutput = formOutput.merge(
  z.object({ fields: z.array(fieldOutput).describe("Ordered list of form fields") }),
);
export type FormWithFieldsOutput = z.infer<typeof formWithFieldsOutput>;

export const publicFormOutput = z.object({
  id: z.string().describe("UUID of the form"),
  title: z.string().describe("Form title"),
  slug: z.string().describe("URL-safe identifier"),
  description: z.string().nullable().describe("Optional subtitle"),
  successMessage: z.string().nullable().describe("Post-submission message"),
  closedMessage: z.string().nullable().describe("Message when form is closed"),
  collectEmail: z.boolean().nullable().describe("Whether respondent email is requested"),
  isPasswordProtected: z.boolean().describe("True when a password is required"),
  isClosed: z.boolean().describe("True when form no longer accepts responses"),
  closedReason: z.string().nullable().describe("Reason code for closure"),
  fields: z.array(fieldOutput).describe("Fields; empty array when form is closed"),
  themeId: z.string().nullable().describe("Applied theme UUID"),
});
export type PublicFormOutput = z.infer<typeof publicFormOutput>;

export const themeOutput = z.object({
  id: z.string().describe("UUID of the theme"),
  name: z.string().describe("Display name"),
  description: z.string().nullable().describe("Short description of the theme"),
  primaryColor: z.string().nullable().describe("Hex primary color"),
  backgroundColor: z.string().nullable().describe("Hex background color"),
  textColor: z.string().nullable().describe("Hex text color"),
});
export type ThemeOutput = z.infer<typeof themeOutput>;

export const slimFieldOutput = z.object({
  id: z.string().describe("UUID of the field"),
  label: z.string().describe("Visible label"),
  fieldType: z.string().describe("Input control type"),
  required: z.boolean().nullable().describe("Whether required"),
  orderIndex: z.number().describe("Position among fields"),
  config: z.unknown().nullable().describe("Display config"),
});
export type SlimFieldOutput = z.infer<typeof slimFieldOutput>;

export const templateWithFieldsOutput = formOutput.merge(
  z.object({ fields: z.array(slimFieldOutput).describe("Ordered list of template fields") }),
);
export type TemplateWithFieldsOutput = z.infer<typeof templateWithFieldsOutput>;
