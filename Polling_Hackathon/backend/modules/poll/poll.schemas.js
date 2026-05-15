import { z } from "zod";

const OptionSchema = z.object({
    id:   z.string().min(1).max(100),
    text: z.string().min(1).max(500),
});

const QuestionSchema = z.object({
    content:     z.string().min(1).max(1000),
    isMandatory: z.boolean().default(false),
    options:     z.array(OptionSchema).min(2, "Each question needs at least 2 options").max(10, "Maximum 10 options per question"),
});

export const CreatePollSchema = z.object({
    title:             z.string().min(1).max(255),
    description:       z.string().max(5000).optional().nullable(),
    slug:              z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens").optional(),
    anonymousAllowed:  z.boolean().default(false),
    expiresAt:         z.string().datetime({ offset: true }).optional().nullable(),
    publishOn:         z.string().datetime({ offset: true }).optional().nullable(),
    resultsVisibility: z.enum(["all", "respondents", "private"]).default("all"),
    questions:         z.array(QuestionSchema).min(1, "At least one question is required").max(20, "Maximum 20 questions per poll"),
});

export const UpdatePollSchema = z.object({
    title:             z.string().min(1).max(255).optional(),
    description:       z.string().max(5000).optional().nullable(),
    anonymousAllowed:  z.boolean().optional(),
    expiresAt:         z.string().datetime({ offset: true }).optional().nullable(),
    publishOn:         z.string().datetime({ offset: true }).optional().nullable(),
    resultsVisibility: z.enum(["all", "respondents", "private"]).optional(),
    questions:         z.array(QuestionSchema).min(1).max(20).optional(),
});

export const SubmitResponseSchema = z.object({
    answers: z.array(
        z.object({
            questionId:       z.string().uuid(),
            selectedOptionId: z.string().min(1).max(100),
        })
    ).min(1, "At least one answer is required").max(20, "Maximum 20 answers per submission"),
});
