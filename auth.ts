import { UserRole } from "./lib/generated/prisma";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { getUserById } from "./data/user";

// signIn, signOut methods can use in Server action
export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      if (!user.id) return false;
      const existingUser = await getUserById(user.id);

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;

      // TODO: ADD 2FA check

      return true;
    },
    async session({ token, session }) {
      console.log({ sesstionToken: token });

      if (token.sub && session.user) {
        // jwt has "sub" which is id, so here added Id into session
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token; // which means user has logged out

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      token.role = existingUser.role;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" }, // prisma doesn't work in the edge, we cannot use the database session strategy
  ...authConfig,
});
