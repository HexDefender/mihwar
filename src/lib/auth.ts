import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

const credentialsSchema = z.object({
  identifier: z.string().min(2),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const log = (msg: string, extra?: unknown) =>
          console.log(`[mihwar:auth] ${msg}`, extra ?? "");

        const parsed = credentialsSchema.safeParse({
          identifier: typeof raw?.identifier === "string" ? raw.identifier.trim() : raw?.identifier,
          password: typeof raw?.password === "string" ? raw.password : raw?.password,
        });
        if (!parsed.success) {
          log("rejected: schema parse failed", parsed.error.flatten());
          return null;
        }
        const { identifier, password } = parsed.data;
        log(`attempt for identifier=${identifier}`);

        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
              active: true,
            },
          });
          if (!user) {
            log("rejected: no active user matched identifier");
            return null;
          }
          log(`found user id=${user.id} email=${user.email} role=${user.role}`);

          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) {
            log("rejected: bcrypt mismatch");
            return null;
          }

          log("✓ accepted");
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            username: user.username,
            nameAr: user.nameAr,
            image: user.avatarUrl,
          };
        } catch (err) {
          log("FATAL during authorize", err instanceof Error ? err.message : err);
          return null;
        }
      },
    }),
  ],
});
