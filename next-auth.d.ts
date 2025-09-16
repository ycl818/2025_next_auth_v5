import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

// can add more stuff to store into session
export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  // customFieldz: string;
  // hello: object;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
