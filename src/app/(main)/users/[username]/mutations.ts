"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { UpdateUserProfileValues } from "@/lib/validation";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { updateUserProfile } from "./actions";
import { PostsPage } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export function useUpdateProfileDataMutation() {
  const { startUpload: startUploadAvatar } = useUploadThing("avatar");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: UpdateUserProfileValues;
      avatar?: File;
    }) => {
      return Promise.all([
        updateUserProfile(values),
        avatar && startUploadAvatar([avatar]),
      ]);
    },
    onSuccess: async ([updatedUser, uploadResult], _variables, _context) => {
      const newAvatarUrl = uploadResult?.[0].serverData.avatar;
      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"],
      };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.userId === updatedUser?.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      avatar: newAvatarUrl || updatedUser.avatar,
                    },
                  };
                } else {
                  return post;
                }
              }),
            })),
          };
        },
      );

      router.refresh(); // this will update the server component with the latest data

      toast({
        description: "Profile Updated",
      });
    },
    onError: (err) => {
      console.log(err);
      toast({
        variant: "destructive",
        description: "Failed to update profile. Please try again.",
      });
    },
  });
  return mutation;
}
