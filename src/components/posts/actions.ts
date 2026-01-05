"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { postDataInclude } from "@/lib/types";

export async function deletePosts(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized!");

  const post = await prisma.post.findUnique({
    where: {
      id: id,
    },
  });

  if (!post) throw new Error("Post not found!");

  if (user.id !== post.userId) throw new Error("Unauthorized!");

  const deletedPost = await prisma.post.delete({
    where: {
      id: id,
    },
    include: postDataInclude
  });

  return deletedPost;
}
