"use server";

import { LoginSchema } from "@/schemas";
import * as z from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  return { success: "Good!!" };
};
