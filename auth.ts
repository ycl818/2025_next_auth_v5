import NextAuth from "next-auth";
import authConfig from "@/auth.config";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

// signIn, signOut methods can use in Server action
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" }, // prisma doesn't work in the edge, we cannot use the database session strategy
  ...authConfig,
});
