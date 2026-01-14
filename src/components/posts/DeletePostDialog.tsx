import { PostData } from "@/lib/types";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useDeletePostMutation } from "./mutations";
import { useToast } from "../ui/use-toast";
import LoadingButton from "../LoadingButton";

interface DeletePostDialogProps {
  open: boolean;
  post: PostData;
  onclose: () => void;
}

export default function DeletePostDialog({
  open,
  post,
  onclose,
}: DeletePostDialogProps) {
  const mutation = useDeletePostMutation();

  const toast = useToast();

  const handleDeletePost = () => {
    mutation.mutate(post.id, {
      onSuccess: onclose,
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open || !mutation.isPending) {
      onclose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Post?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </DialogDescription>
          <DialogFooter className="mt-5 pt-5">
            <LoadingButton
              variant={"destructive"}
              onClick={handleDeletePost}
              loading={mutation.isPending}
            >
              Delete
            </LoadingButton>
            <Button
              variant="outline"
              onClick={onclose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
