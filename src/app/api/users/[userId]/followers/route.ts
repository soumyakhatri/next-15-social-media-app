import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";

export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        followers: {
          where: {
            followerId: loggedInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };
    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const upsertFollow = prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      },
      create: {
        followerId: loggedInUser.id,
        followingId: userId,
      },
      update: {},
    });

    const createNotification = prisma.notification.create({
      data: {
        issuerId: loggedInUser.id,
        recipientId: userId,
        type: "FOLLOW",
      },
    });

    await prisma.$transaction([upsertFollow, createNotification]);

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleteFollow = prisma.follow.deleteMany({
      where: {
        followerId: loggedInUser.id,
        followingId: userId,
      },
    });

    // we dont have the id of the follow to be deleted. Delete wont work without it. therefore using deleteMany
    const deleteNotification = prisma.notification.deleteMany({
      where: {
        issuerId: loggedInUser.id,
        recipientId: userId,
        type: "FOLLOW",
      },
    });

    await prisma.$transaction([deleteFollow, deleteNotification]);

    return new Response();
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
