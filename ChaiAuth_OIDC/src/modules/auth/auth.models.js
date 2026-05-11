import { z } from "zod";

export const LoginSchema = z.object({
    username: z.string()
        .min(2, "Username must be at least 2 characters")
        .max(50, "Username too long")
        .regex(/^[a-zA-Z0-9_.-]+$/, "Username may only contain letters, numbers, _, ., -"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(255, "Password too long")
        .regex(/[A-Z]/, "Must include an uppercase letter")
        .regex(/[a-z]/, "Must include a lowercase letter")
        .regex(/[0-9]/, "Must include a number"),
});

export const SignUpSchema = z.object({
    username: z.string()
        .min(2, "Username must be at least 2 characters")
        .max(50, "Username too long")
        .regex(/^[a-zA-Z0-9_.-]+$/, "Username may only contain letters, numbers, _, ., -"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(255, "Password too long")
        .regex(/[A-Z]/, "Must include an uppercase letter")
        .regex(/[a-z]/, "Must include a lowercase letter")
        .regex(/[0-9]/, "Must include a number"),
    display_name: z.string().max(100, "Display name too long").optional(),
    email: z.string().email("Invalid email address").max(255).optional().or(z.literal("")),
    avatar_url: z.string().url("Avatar must be a valid URL").max(2048).optional().or(z.literal("")),
    bio: z.string().max(280, "Bio must be 280 characters or less").optional(),
    organization: z.string().max(100, "Organization too long").optional(),
});
