import { UserRole } from "./lib/generated/prisma";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { getUserById } from "./data/user";
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation";

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
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );

        if (!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign in  登入後就刪除掉confrimation
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true; // 讓使用者登入
    },
    async session({ token, session }) {
      // session 會跟token一樣， token那邊先加入field

      console.log({ sesstionToken: token });

      if (token.sub && session.user) {
        // jwt has "sub" which is id, so here added Id into session
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole; // user.role的role 會有typescript error所以才要extend next-auth.d.ts
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      // if (token.hello && session.user) {
      //   session.user.hello = token.hello;
      // }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token; // which means user has logged out

      const existingUser = await getUserById(token.sub); // 這樣可以去db 取自己要的field存到token, pass to session

      if (!existingUser) return token;

      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      // token.hello = "hello";

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" }, // prisma doesn't work in the edge, we cannot use the database session strategy
  ...authConfig,
});
