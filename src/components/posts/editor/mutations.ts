import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { PostsPage } from "@/lib/types";
import { useSession } from "@/app/(main)/sessionProvider";

export function useSubmitPostMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();
  const { user } = useSession();
  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost, _variables, _context) => {
      // newPost is the new post created by submitPosts
      const queryFilter = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(user.id))
          );
        },
      } satisfies QueryFilters;
      // predicate
      // It runs once for every query in the cache and returns:
      // true → this query will be affected
      // false → this query will be ignored
      // queryKey: ["post-feed"]
      // This narrows down the search to only queries whose key starts with or contains "post-feed".
      // predicate(query)
      // This further filters which of those matched queries should be affected.

      await queryClient.cancelQueries(queryFilter);

      // the data we are updating is from infiniteData type which is from infinite query( postsPages and pageParams)
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>( // string | null is type for cursor/pageParams
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData?.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate: (query) => {
          return !query.state.data && queryFilter.predicate(query); // Invalidate only the queries that match this condition // we are doing: Invalidate only those queries whose data is missing or undefined.
        },
      });

      toast({
        variant: "default",
        description: "Post created",
      });
    },
    onError: (error, _variables, _context) => {
      console.log(error);
      toast({
        variant: "destructive",
        description: "An error occurred while submiting the post",
      });
    },
  });

  return mutation;
}
