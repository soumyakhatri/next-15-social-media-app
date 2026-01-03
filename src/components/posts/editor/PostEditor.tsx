"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import UserAvatar from "@/components/UserAvatar";
import { useSession } from "@/app/(main)/sessionProvider";
import { Button } from "@/components/ui/button";
import { submitPosts } from "./actions";
import "./styles.css"

export default function PostEditor() {
  const { user } = useSession();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        italic: false,
        bold: false,
      }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
  });

  if (!editor) {
    return null; // Prevent rendering until the editor is initialized
  }

  const input = editor?.getText({ blockSeparator: "\n" }) || "";

  const onSubmit = async () => {
    await submitPosts(input);
    editor?.commands.clearContent()
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <EditorContent
          editor={editor}
          className="max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3"
        />
      </div>
      <div className="flex justify-end">
        <Button
            onClick={onSubmit}
            disabled={!input.trim()}
            className="min-w-20"
        >
            Post
        </Button>
      </div>
    </div>
  );
}
