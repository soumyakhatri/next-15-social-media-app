import { validateRequest } from "@/auth";
import { notifyUserCreated , notifyUserDeleted  } from "@/lib/notifySocket";
import prisma from "@/lib/prisma";
import { LikeInfo, notificationsInclude } from "@/lib/types";

export async function GET(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        // to check whether the post is liked by the loggedIn user
        likes: {
          where: {
            userId: loggedInUser.id,
          },
        },
        // to find the total likes on the post
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const data: LikeInfo = {
      isLikedByUser: !!post.likes.length,
      likes: post._count.likes,
    };

    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // the user has liked certain post.

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const upsertLike = prisma.like.upsert({
      where: {
        postId_userId: {
          postId: postId,
          userId: loggedInUser.id,
        },
      },
      create: {
        postId: postId,
        userId: loggedInUser.id,
      },
      update: {},
    });

    const createNotification = prisma.notification.create({
      data: {
        issuerId: loggedInUser.id,
        recipientId: post.userId,
        postId: post.id,
        type: "LIKE",
      },
      include: notificationsInclude,
    });

    const [_newLike, notification] = await prisma.$transaction([
      upsertLike,
      ...(post.userId !== loggedInUser.id ? [createNotification] : []),
    ]);

    if (post.userId !== loggedInUser.id) {
      await notifyUserCreated (post.userId, notification);
    }

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const deleteLike = prisma.like.deleteMany({
      where: {
        postId: postId,
        userId: loggedInUser.id,
      },
    });

    // we dont have the id of the like to be deleted. Delete wont work without it. therefore using deleteMany
    const findNotification = prisma.notification.findFirst({
      where: {
        issuerId: loggedInUser.id,
        recipientId: post.userId,
        type: "LIKE",
        postId: post.id,
      },
    });

    // deleteMany need not be in a condition because if there is no notification if will just be ignored.
    // notification is not created when the user likes his own post, therefore there is nothing to delete. hence no condition needed.

    const [_deletedLike, linkedNnotification] = await prisma.$transaction([
      deleteLike,
      findNotification,
    ]);

    const deletedNotification = await prisma.notification.delete({
      where: {
        id: linkedNnotification?.id,
      },
    });

    if (post.userId !== loggedInUser.id) {
      await notifyUserDeleted (post.userId, deletedNotification.id);
    }

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
