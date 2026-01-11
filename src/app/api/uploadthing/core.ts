import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const utapi = new UTApi();

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
    .onUploadError((err) => console.log("error OnUploadError", err))
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata.user.avatar;

      if(oldAvatarUrl){
        const arr = oldAvatarUrl.split("/")
        const key = arr[arr.length -1]

        await utapi.deleteFiles(key)
      }
      // This code RUNS ON YOUR SERVER after upload
      const newAvatarUrl = file.ufsUrl;
      await prisma.user.update({
        where: {
          id: metadata.user.id,
        },
        data: {
          avatar: newAvatarUrl,
        },
      });
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { avatar: newAvatarUrl };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
