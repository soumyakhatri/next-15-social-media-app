import { CommentData } from "@/lib/types";
import UserTooltip from "../UserTooltip";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate } from "@/lib/utils";
import CommentMoreButton from "./CommentMoreButton";
import { useSession } from "@/app/(main)/sessionProvider";

interface CommentProps {
  comment: CommentData;
}

export default function Comment({ comment }: CommentProps) {
  const { user } = useSession();
  return (
    <div className="flex items-center justify-between group/comment">
      <div className="flex gap-3 py-3">
        <span className="hidden sm:inline">
          <UserTooltip user={comment.user}>
            <Link href={`/users/${comment.user.username}`}>
              <UserAvatar avatarUrl={comment.user.avatar} size={40} />
            </Link>
          </UserTooltip>
        </span>
        <div>
          <div className="flex items-center gap-1 text-sm">
            <UserTooltip user={comment.user}>
              <Link
                href={`/users/${comment.user.username}`}
                className="font-medium hover:underline"
              >
                {comment.user.displayName}
              </Link>
            </UserTooltip>
            <span className="text-muted-foreground">
              {formatRelativeDate(comment.createdAt)}
            </span>
          </div>
          <div>{comment.content}</div>
        </div>
      </div>
      {user.id === comment.userId && <CommentMoreButton comment={comment} className="opacity-0 transition-opacity group-hover/comment:opacity-100"/>}
    </div>
  );
}
