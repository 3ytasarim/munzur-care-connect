import { createServerFn } from "@tanstack/react-start";

import { registerCaregiverAccount, signInWithPassword } from "@/db/auth-queries.server";
import { endSession, getSessionUser } from "@/lib/auth.server";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/auth-schemas";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  return getSessionUser();
});

export const loginUser = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): LoginInput => loginSchema.parse(input))
  .handler(async ({ data }) => signInWithPassword(data));

export const registerCaregiver = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): RegisterInput => registerSchema.parse(input))
  .handler(async ({ data }) => registerCaregiverAccount(data));

export const logoutUser = createServerFn({ method: "POST" }).handler(async () => {
  await endSession();
  return { ok: true as const };
});
