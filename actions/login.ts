"use server";

import { signIn } from "@/auth";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import * as z from "zod";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return {
      error: "信箱不存在或已使用此信箱快速登入",
    };
  }

  if (!existingUser.emailVerified) {
    const verficationToken = await generateVerificationToken(
      existingUser.email
    );

    await sendVerificationEmail(verficationToken.email, verficationToken.token);

    return { success: "Confirmation email sent!" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT, // 加這個用意是 假如callback之後值是null callback | DEFAULT_LOGIN_REDIRECT， 就不會redirectTo所以要有default
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials 帳號或密碼錯誤" };
        default:
          return { error: "Something went wrong! 不預期的錯誤" };
      }
    }

    throw error; // 要這個才會redirect
  }
};
