import { Prisma } from "@prisma/client";

export const getUserDataSelect = (loggedInUserId: string) => {
  return {
    id: true,
    username: true,
    displayName: true,
    avatar: true,
    bio: true,
    createdAt: true,
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    _count: {
      select: {
        followers: true,
        posts: true
      },
    },
  } satisfies Prisma.UserSelect;
};

export const getPostDataInclude = (loggedInUserId: string) => {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    attachments: true
  } satisfies Prisma.PostInclude;
};

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>
}>

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}
