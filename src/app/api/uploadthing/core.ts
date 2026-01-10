import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const fileRouter = {
  avatar: f({
    image: {
      maxFileSize: "512KB",
    },
  })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const { user } = await validateRequest();
      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.user.username);
      console.log("file url", file.url);
      const newAvatarUrl = file.url.replace('/f/', `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}`)

      await prisma.user.update({
        where: {
            id: metadata.user.id
        },
        data: {
            avatar: newAvatarUrl
        }
      })
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { avatar: newAvatarUrl };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;


