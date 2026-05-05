"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

export type SignInState = { error?: string } | null;

export async function signInAction(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard");

  if (!identifier || !password) {
    return { error: "INVALID_INPUT" };
  }

  try {
    await signIn("credentials", {
      identifier,
      password,
      redirectTo,
    });
    return null;
  } catch (err) {
    if (err instanceof AuthError) {
      const code =
        err.type === "CredentialsSignin" ? "INVALID_CREDENTIALS" : err.type;
      return { error: code };
    }
    throw err;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
