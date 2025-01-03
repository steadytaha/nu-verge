"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const getUserData = async (id?: string) => {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const user_info = await db.user.findUnique({
    where: {
      clerkId: user.id,
    },
    include: {
      connections: true,
    },
  });
  console.log(user_info);
  return user_info;
};
export const getUserId = async () => {
  const user = await currentUser();
  return user?.id;
}
