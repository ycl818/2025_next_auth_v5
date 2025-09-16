import { auth } from "@/auth";

export const currentUser = async () => {
  // server action
  const session = await auth();

  return session?.user;
};
