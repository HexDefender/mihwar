import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      nameAr?: string | null;
      username: string;
      role: "ADMIN" | "MEMBER";
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role?: "ADMIN" | "MEMBER";
    username?: string;
    nameAr?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "MEMBER";
    username?: string;
    nameAr?: string | null;
  }
}
