import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { PostData } from "@/lib/types";
import { useState } from "react";
import DeletePostDialog from "./DeletePostDialog";

type PostMoreButtonProps = {
  className?: string;
  post: PostData;
};

export default function PostMoreButton({
  className,
  post,
}: PostMoreButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={"icon"} variant={"ghost"} className={className}>
            <MoreHorizontal className="size-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="focus-visible:outline-none cursor-pointer" onClick={() => setShowDeleteDialog(true)}>
            <span className="flex items-center gap-3 text-destructive">
              <Trash2 className="size-4" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeletePostDialog
        onclose={() => setShowDeleteDialog(false)}
        open={showDeleteDialog}
        post={post}
      />
    </>
  );
}
