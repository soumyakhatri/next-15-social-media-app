"use client";

import { LikeInfo } from "@/lib/types";
import { useToast } from "../ui/use-toast";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialState: LikeInfo;
}

export default function LikeButton({ initialState, postId }: LikeButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["like", postId];

  const { data } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/likes`).json<LikeInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isLikedByUser
        ? kyInstance.delete(`/api/posts/${postId}/likes`)
        : kyInstance.post(`/api/posts/${postId}/likes`),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });

      const prevState = queryClient.getQueryData<LikeInfo>(queryKey);

      queryClient.setQueryData<LikeInfo>(queryKey, () => {
        const newState: LikeInfo = {
          isLikedByUser: !prevState?.isLikedByUser,
          likes: (prevState?.likes || 0) + (prevState?.isLikedByUser ? -1 : 1),
        };
        return newState;
      });
      return prevState;
    },
    onError(error, _variables, context) {
      // context is the value returned by the onMutate function
      console.log(error);
      toast({
        variant: "destructive",
        description: "Some",
      });
      queryClient.setQueryData<LikeInfo>(queryKey, () => {
        return context;
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Heart
        className={cn(
          "size-5",
          data.isLikedByUser && "fill-red-500 text-red-500",
        )}
      />
      <span className="text-sm font-medium tabular-nums">
        {data.likes} <span className="hidden sm:inline">likes</span>
      </span>
    </button>
  );
}
