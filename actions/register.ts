"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  // when user register and valid ok
  const { email, password, name } = validatedFields.data;

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "此信箱已被註冊" };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const verficationToken = await generateVerificationToken(email);

  await sendVerificationEmail(verficationToken.email, verficationToken.token);

  return { success: "Confirm Email has sent 信箱確認信已寄出" };
};
