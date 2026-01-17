"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, PostData } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";

export async function submitComment({
  content,
  post,
}: {
  content: string;
  post: PostData;
}) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    throw new Error("Unauthorized");
  }

  const { content: contentValidated } = createCommentSchema.parse({
    content,
  });

  const newComment = await prisma.comment.create({
    data: {
      content: contentValidated,
      postId: post.id,
      userId: loggedInUser.id,
    },
    include: getCommentDataInclude(loggedInUser.id),
  });

  return newComment;
}

export async function deleteComment(commentId: string) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    throw new Error("Unauthorized");
  }

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (!comment) throw new Error("Comment not found");

  if (comment.userId !== loggedInUser.id) {
    throw new Error("Unauthorized");
  }

  const deletedComment = await prisma.comment.delete({
    where: {
      id: commentId,
    },
    include: getCommentDataInclude(loggedInUser.id),
  });

  if (!deletedComment) {
    throw new Error("Comment not found");
  }
  return deletedComment;
}
