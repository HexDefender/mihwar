"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function signInAction(data: {
  identifier: string;
  password: string;
  redirectTo?: string;
}): Promise<{ error?: string } | undefined> {
  try {
    await signIn("credentials", {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    });
    return undefined;
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: err.type };
    }
    throw err;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
