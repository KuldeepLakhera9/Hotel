"use server";

import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { hashPassword } from "@/lib/password";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { signIn } from "@/lib/auth";

type SignupResult = { success: true } | { success: false; error: string };

export async function signupAction(input: SignupInput): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await connectDB();
  const existing = await User.findOne({
    $or: [{ username: parsed.data.username }, { email: parsed.data.email }],
  });
  if (existing) {
    return { success: false, error: "A user with that username or email already exists" };
  }

  const hash = await hashPassword(parsed.data.password);
  await User.create({
    username: parsed.data.username,
    email: parsed.data.email,
    hash,
    role: "USER",
  });

  // Signs the new user in and redirects — throws a Next.js redirect signal,
  // so nothing after this call in a caller's try/catch should assume it returns.
  await signIn("credentials", {
    username: parsed.data.username,
    password: parsed.data.password,
    redirectTo: "/listings",
  });

  return { success: true };
}
