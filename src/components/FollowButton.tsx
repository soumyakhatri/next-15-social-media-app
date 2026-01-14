"use client";

import { FollowerInfo } from "@/lib/types";
import { Button } from "./ui/button";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import {
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { useToast } from "./ui/use-toast";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}
export default function FollowButton({
  userId,
  initialState,
}: FollowButtonProps) {
  const { toast } = useToast();

  const { data } = useFollowerInfo(userId, initialState);

  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["follower-info", userId];

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const prevState = queryClient.getQueryData<FollowerInfo>(queryKey);

      queryClient.setQueryData<FollowerInfo>(queryKey, () => {
        const newState: FollowerInfo = {
          followers:
            (prevState?.followers || 0) + (data.isFollowedByUser ? -1 : 1),
          isFollowedByUser: !prevState?.isFollowedByUser,
        };
        return newState;
      });
      return prevState;
    },
    onError(error, _variables, context) {
        console.log(error)
      toast({
        variant: "destructive",
        description: "Some",
      });
      queryClient.setQueryData<FollowerInfo>(queryKey, () => {
        return context;
      });
    },
  });
  return (
    <Button
      onClick={() => mutate()}
      variant={data.isFollowedByUser ? "secondary" : "default"}
    >
      {data.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  );
}
