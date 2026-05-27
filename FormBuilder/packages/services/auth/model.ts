import { z } from "zod";

export const registerInput = z.object({
  name: z.string().min(1).max(120),
  email: z.email(),
  password: z.string().min(8).max(128),
});
export type RegisterInput = z.infer<typeof registerInput>;

export const loginInput = z.object({
  email: z.email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginInput>;

export const googleLoginInput = z.object({
  idToken: z.string().min(1),
});
export type GoogleLoginInput = z.infer<typeof googleLoginInput>;

export const forgotPasswordInput = z.object({
  email: z.email(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInput>;

export const resetPasswordInput = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordInput>;

export const purgeDeletedAccountsInput = z.object({
  cronSecret: z.string(),
});
export type PurgeDeletedAccountsInput = z.infer<typeof purgeDeletedAccountsInput>;

export const userOutput = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string().nullable(),
});
export type UserOutput = z.infer<typeof userOutput>;

export const authOutput = z.object({
  accessToken: z.string(),
  user: userOutput,
});
export type AuthOutput = z.infer<typeof authOutput>;

export const meOutput = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  role: z.string().nullable(),
});
export type MeOutput = z.infer<typeof meOutput>;
