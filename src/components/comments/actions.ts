"use server";

import { validateRequest } from "@/auth";
import { notifyUserCreated  } from "@/lib/notifySocket";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, notificationsInclude, PostData } from "@/lib/types";
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

  const createComment = prisma.comment.create({
    data: {
      content: contentValidated,
      postId: post.id,
      userId: loggedInUser.id,
    },
    include: getCommentDataInclude(loggedInUser.id),
  });

 const createNotification = prisma.notification.create({
      data: {
        issuerId: loggedInUser.id,
        recipientId: post.userId,
        type: "COMMENT",
        postId: post.id
      },
      include: notificationsInclude
    });
  const [newComment, notification] = await prisma.$transaction([createComment, ...(loggedInUser.id !== post.userId ? [createNotification] : []) ])
  await notifyUserCreated (post.userId, notification)
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

  // we dont need notification for deleting a comment
  // we cant identify which comment got deleted
  // if we want to do it then we will have to use another row in Notification table called CommentId

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
