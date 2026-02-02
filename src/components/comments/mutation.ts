import { CommentsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import { deleteComment, submitComment } from "./actions";

export function useSubmitCommentMutation(postId: string) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitComment,
    onSuccess: async (newComment) => {
      const queryKey: QueryKey = ["comments", postId];

      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        (oldData) => {
          // since its type is InfiniteData it will always have this format:
          // oldData : {
          //   pageParams : string[] | null,
          //   pages: someData[]
          // }
          if (!oldData) return oldData;
          const firstPage = oldData?.pages[0];
          // since the latest comments will be shown at the bottom we will push it at the end of the array.
          // for this particular requirement each new fetch with infinite loading will fetch older comments. it is in ascending order
          // so the first fetch actually brings the newest comments with old to new order (asc)
          if (firstPage) {
            return {
              pageParams: oldData.pageParams, // the latest cursor
              pages: [
                {
                  comments: [...firstPage.comments, newComment],
                  previousCursor: firstPage.previousCursor,
                },
                ...oldData.pages.slice(1), // all pages except the first one. the one at position 0.
              ],
            };
          }
        },
      );

      queryClient.invalidateQueries({
        queryKey,
        predicate(query) {
          return !query.state.data; // invalidate only when data does not exist
        },
      });

      toast({
        description: "Comment created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to submit comment. Please try again.",
      });
    },
  });

  return mutation;
}

export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async (deletedComment) => {
      const queryKey: QueryKey = ["comments", deletedComment.postId];

      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              previousCursor: page.previousCursor,
              comments: page.comments.filter(
                (comment) => comment.id !== deletedComment.id,
              ),
            })),
          };
        },
      );
      toast({
        description: "Comment deleted",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete comment. Please try again.",
      });
    },
  });
  return mutation;
}
