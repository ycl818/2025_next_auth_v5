"use server";

import { signIn } from "@/auth";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "@/lib/mail";
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from "@/lib/tokens";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import * as z from "zod";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return {
      error: "信箱不存在或已使用此信箱快速登入",
    };
  }

  // 信箱還沒驗證過的話 會寄驗證email信件
  if (!existingUser.emailVerified) {
    const verficationToken = await generateVerificationToken(
      existingUser.email
    );

    await sendVerificationEmail(verficationToken.email, verficationToken.token);

    return { success: "Confirmation email sent!" };
  }

  // TODO 應該要先檢查 密碼有沒有登入對，對了才去send 2FA email
  const passwordMatch = await bcrypt.compare(password, existingUser.password);
  if (!passwordMatch) return { error: "登入密碼輸入錯誤!" };

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      // Todo: verify code  假如收到前端code data就做驗證，沒有的話就寄送code

      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        return { error: "Invalid code!" };
      }

      if (twoFactorToken.token !== code) {
        return { error: "驗證碼錯誤!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "驗證碼已過期! 請重新登入取得新的驗證碼" };
      }

      // TODo 可能要新加入驗整瑪過期的話 回到login page

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      // 找是否存在confirmation
      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );

      // 有的話先刪掉
      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      // 會先創建confirmation在try to login 前
      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
      // 接著後面就會到sign in callback auth.ts
    } else {
      // TODO 這裡一有2FA 一開始產生token的地方
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true }; // for frontend display
    }
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
