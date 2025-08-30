import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "信箱格式錯誤" }),
  password: z.string().min(1, {
    message: "密碼不得為空",
  }),
});
