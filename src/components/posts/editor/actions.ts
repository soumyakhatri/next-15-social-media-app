"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}) {
  const { user } = await validateRequest();

  if (!user) throw Error("Unauthorized");

  const { content, mediaIds } = createPostSchema.parse(input);

  const newPost = await prisma.post.create({
    data: {
      content: content,
      attachments: {
        // the media is already uploaded (code in core.ts) and its url and type is already stored in Media Table. we are just connecting them with this post
        connect: mediaIds.map((mediaId) => ({
          id: mediaId,
        })),
      },
      userId: user.id,
    },
    include: getPostDataInclude(user.id),
  });
  return newPost;
}
