import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" as const, maxAge: 60 * 60 * 24 * 14 },
  trustHost: true,
  callbacks: {
    authorized({ auth, request }) {
      const url = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = url.pathname.startsWith("/dashboard");
      const isOnLogin = url.pathname === "/login";

      if (isOnDashboard && !isLoggedIn) {
        const redirect = new URL("/login", url.origin);
        redirect.searchParams.set("from", url.pathname);
        return Response.redirect(redirect);
      }
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", url.origin));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const role = (user as { role?: "ADMIN" | "MEMBER" }).role;
        token.role = role ?? "MEMBER";
        token.username = (user as { username?: string }).username;
        token.nameAr = (user as { nameAr?: string | null }).nameAr ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "MEMBER";
        session.user.username = token.username as string;
        session.user.nameAr = (token.nameAr as string | null) ?? null;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
