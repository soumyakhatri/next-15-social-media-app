import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";

export interface Attachment {
  file: File;
  mediaId?: string; // we get the mediaId only after the upload is done. but file will already be there always.
  isUploading: boolean;
}

export default function useMediaUploads() {
  const { toast } = useToast();

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>();

  const { startUpload, isUploading } = useUploadThing("attachments", {
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();
        return new File(
          [file],
          `attachment_${crypto.randomUUID()}.${extension}`,
          {
            type: file.type,
          },
        );
      });
      setAttachments((prev) => [
        ...prev,
        ...renamedFiles.map((file) => ({ file, isUploading: true })),
      ]);
      return renamedFiles;
    },
    onUploadProgress(p) {
      setUploadProgress(p);
    },
    onClientUploadComplete(res) {
      // we are appending mediaId to the attachments state
      setAttachments((prev) =>
        prev.map((a) => {
          const uploadedFile = res.find((r) => r.name === a.file.name);
          if (!uploadedFile) {
            // if the file does not exist in the current upload.
            return a;
          } else {
            return {
              ...a,
              isUploading: false,
              mediaId: uploadedFile.serverData.mediaId,
            };
          }
        }),
      );
    },
    onUploadError(e) {
      // if loading is complete(false) that means upload is complete.
      // we remove the ones whose isUploading is still in true state.
      setAttachments((prev) => prev.filter((a) => a.isUploading === false));

      toast({
        variant: "destructive",
        description: "",
      });
    },
  });

  // we call this from the front end
  const handleStartUpload = (files: File[]) => {
    if (isUploading) {
      toast({
        variant: "destructive",
        description: "Please wait for the current upload to finish",
      });
      return;
    }

    if (attachments.length + files.length > 5) {
      toast({
        variant: "destructive",
        description: "You can upload only up to 5 attachments per post.",
      });
      return;
    }
    startUpload(files);
  };

  const removeAttachment = (fileName: string) => {
    setAttachments(prev => prev.filter(a => a.file.name !== fileName))
  }

  const reset = () => {
    setAttachments([]);
    setUploadProgress(undefined)
  }

  return {
    startUpload: handleStartUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset
  }
}
