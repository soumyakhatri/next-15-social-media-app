import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deletePosts } from "./actions";
import { useToast } from "../ui/use-toast";
import { PostsPage } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";

export function useDeletePostMutation() {
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deletePosts,
    onSuccess: async (deletedPost, _variables, _context) => {
      const queryFilter: QueryFilters = { queryKey: ["post-feed"] }; // not included "for you" because we want to update all posts feed no matter where they are on the screen

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, null | string>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;
          const updatedPages = oldData.pages.map((page) => ({
            posts: page.posts.filter((post) => post.id !== deletedPost.id),
            nextCursor: page.nextCursor,
          }));
          return {
            pageParams: oldData.pageParams,
            pages: updatedPages,
          };
        },
      );
      toast({
        description: "Post deleted",
      });

      if (pathname === `/posts/${deletedPost.id}`) {
        router.push(`/users/${deletedPost.user.username}`);
      }
    },
    onError(error, _variables, _context) {
      console.log(error);
      toast({
        description: "Error while deleting post",
        variant: "destructive",
      });
    },
  });

  return mutation;
}
