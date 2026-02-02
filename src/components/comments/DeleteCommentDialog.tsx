import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import LoadingButton from "../LoadingButton";
import { CommentData } from "@/lib/types";
import { useDeleteCommentMutation } from "./mutation";

interface DeleteCommentDialogProps {
  open: boolean;
  comment: CommentData;
  onclose: () => void;
}

export default function DeleteCommentDialog({
  open,
  comment,
  onclose,
}: DeleteCommentDialogProps) {
  const mutation = useDeleteCommentMutation();

  const handleDeleteComment = () => {
    mutation.mutate(comment.id, {
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
          <DialogTitle>Delete Comment?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </DialogDescription>
          <DialogFooter className="mt-5 pt-5">
            <LoadingButton
              variant={"destructive"}
              onClick={handleDeleteComment}
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
