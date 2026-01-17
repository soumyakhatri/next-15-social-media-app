import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { CommentsPage, getCommentDataInclude } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pageSize = 5;

    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    // simple approach, just reversing the order in the final array
    // const comments = await prisma.comment.findMany({
    //   where: {
    //     postId,
    //   },
    //   include: getCommentDataInclude(loggedInUser.id),
    //   orderBy: {
    //     createdAt: "desc", // oldest to newest
    //   },
    //   take: pageSize + 1, // taking from the start. taking one extra
    //   cursor: cursor
    //     ? {
    //         id: cursor,
    //       }
    //     : undefined,
    // });

    // const previousCursor =
    //   comments.length > pageSize ? comments[pageSize].id : null; // the 6th one is the cursor. the last element

    // const data: CommentsPage = {
    //   previousCursor,
    //   comments:
    //     comments.length > pageSize
    //       ? comments.slice(0, pageSize).reverse() // last element removed and reversed
    //       : comments.reverse(), // reversed
    // };

    // reverse pagination approach
    const comments = await prisma.comment.findMany({
      where: {
        postId,
      },
      include: getCommentDataInclude(loggedInUser.id),
      orderBy: {
        createdAt: "asc", // newest to oldest
      },
      take: -pageSize - 1, // taking from the last. negative number
      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,
    });

    const previousCursor = comments.length > pageSize ? comments[0].id : null; // the first element of the array is the cursor

    const data: CommentsPage = {
      previousCursor,
      comments: comments.length > pageSize ? comments.slice(1) : comments // no need to reverse here
    }

    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
