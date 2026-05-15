import { z } from "zod";

export const RegisterSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const GoogleAuthSchema = z.object({
    idToken: z.string().min(1),
});
