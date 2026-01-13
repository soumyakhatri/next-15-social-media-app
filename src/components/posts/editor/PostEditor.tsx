"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import UserAvatar from "@/components/UserAvatar";
import { useSession } from "@/app/(main)/sessionProvider";
import "./styles.css";
import { useSubmitPostMutation } from "./mutations";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, X } from "lucide-react";
import { useRef } from "react";
import useMediaUploads, { Attachment } from "./useMediaUpload";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function PostEditor() {
  const { user } = useSession();
  const mutation = useSubmitPostMutation();
  const {
    attachments,
    isUploading,
    removeAttachment,
    reset: resetMediaUploads,
    startUpload,
    uploadProgress,
  } = useMediaUploads();

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

  const onSubmit = () => {
    mutation.mutate(
      {
        content: input,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          resetMediaUploads();
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatar} className="hidden sm:inline" />
        <EditorContent
          editor={editor}
          className="max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3"
        />
      </div>
      {!!attachments.length && (
        <AttachmentPreviews
          attachments={attachments}
          removeAttachment={removeAttachment}
        />
      )}
      <div className="flex items-center justify-end gap-3">
        {isUploading && (
          <>
            <span className="text-sm">{uploadProgress ?? 0}</span>
            <Loader2 className="size-5 animate-spin text-primary" />
          </>
        )}
        <AddAttachmentsButton
          onFilesSelected={startUpload}
          disabled={isUploading || attachments.length > 5}
        />
        <LoadingButton
          onClick={onSubmit}
          disabled={!input.trim() || isUploading}
          className="min-w-20"
          loading={mutation.isPending }
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}

interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentsButton({
  onFilesSelected,
  disabled,
}: AddAttachmentsButtonProps) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button
        variant={"ghost"}
        size="icon"
        type="button"
        onClick={() => inputFileRef.current?.click()}
        disabled={disabled}
        className="text-primary hover:text-primary"
      >
        <ImageIcon size={20} />
      </Button>
      <input
        type="file"
        ref={inputFileRef}
        className="sr-only hidden"
        accept="image/*, video/*"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []); //e.target.files is not an array. it is a file list. we need to turn it into an array.
          if (files.length) {
            onFilesSelected(files); // we start uploading it as soon as the files are selected. this is actually startUpload
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreviews({
  attachments,
  removeAttachment,
}: AttachmentPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}
interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentPreview({
  attachment: { file, isUploading, mediaId },
  onRemoveClick,
}: AttachmentPreviewProps) {
  let src = URL.createObjectURL(file);

  return (
    <div
      className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="attachment preview"
          width={500}
          height={500}
          className="size-fit max-h-[30rem] rounded-2xl"
        />
      ) : (
        <video controls className="size-fit max-h-[30rem] rounded-2xl">
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
