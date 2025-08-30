"use server";

import * as z from "zod";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";

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

  // TODO: Send verification token email

  return { success: "成功申辦會員" };
};
