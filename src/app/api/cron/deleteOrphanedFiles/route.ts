import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

export async function GET(req: Request) {
  try {
    // 1️⃣ Security
    const auth = req.headers.get("authorization");
    if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2️⃣ Find orphaned files older than 24h
    const unUsedMedia = await prisma.media.findMany({
      where: {
        postId: null,
        createdAt: {
          lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        url: true,
      },
    });

    if (!unUsedMedia.length) {
      return NextResponse.json({ deleted: 0 });
    }

    // 3️⃣ Delete files from UploadThing
    const utapi = new UTApi();

    const keys = unUsedMedia.map(m => m.url.split("/").pop()!);

    await utapi.deleteFiles(keys);

    // 4️⃣ Delete DB rows ONLY after files are gone
    await prisma.media.deleteMany({
      where: {
        id: { in: unUsedMedia.map(m => m.id) },
      },
    });

    return NextResponse.json({
      deleted: keys.length,
      keys,
    });

  } catch (err) {
    console.error("CRON FAILED:", err);
    return new NextResponse("Cron failed", { status: 500 });
  }
}
