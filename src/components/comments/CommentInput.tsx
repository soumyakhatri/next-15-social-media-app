import { PostData } from "@/lib/types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, SendHorizonalIcon } from "lucide-react";
import { FormEvent, useState } from "react";
import { useSubmitCommentMutation } from "./mutation";

interface CommentInputProps {
  post: PostData;
}

export default function CommentInput({ post }: CommentInputProps) {
  const [input, setInput] = useState("");

  const mutation = useSubmitCommentMutation(post.id);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input) return;

    mutation.mutate(
      {
        content: input,
        post,
      },
      {
        onSuccess: () => setInput(""),
      },
    );
  };

  return (
    <form className="flex w-full items-center gap-2" onSubmit={handleSubmit}>
      <Input autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder="Write a comment..."/>
      <Button type="submit" size={"icon"} variant={"ghost"} disabled={mutation.isPending || !input}>
        {mutation.isPending ? <Loader2 className="animate-spin"/> : <SendHorizonalIcon />}
        
      </Button>
    </form>
  );
}
