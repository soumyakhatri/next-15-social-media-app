import { Dispatch, SetStateAction, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import LoadingButton from "./LoadingButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from "@/lib/validation";
import { UserData } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useUpdateProfileDataMutation } from "@/app/(main)/users/[username]/mutations";
import Image, { StaticImageData } from "next/image";
import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { Camera } from "lucide-react";
import Resizer from "react-image-file-resizer";
import CropImageDialog from "./CropImageDialog";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  user: UserData;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
}: EditProfileDialogProps) {
  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
  const form = useForm<UpdateUserProfileValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      bio: user.bio || "",
      displayName: user.displayName,
    },
  });

  const mutation = useUpdateProfileDataMutation();

  const onSubmit = (values: UpdateUserProfileValues) => {
    const newAvatarFile = croppedAvatar
      ? new File([croppedAvatar], `avatar_${user.id}.webp`, { type: "image/webp" })
      : undefined;

    mutation.mutate(
      { values, avatar: newAvatarFile },
      {
        onSuccess: () => {
          onOpenChange(false);
          setCroppedAvatar(null);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <AvatarInput
          src={
            croppedAvatar
              ? URL.createObjectURL(croppedAvatar)
              : user.avatar || avatarPlaceholder
          }
          onImageCropped={setCroppedAvatar}
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>

              <FormField
                name="displayName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your display name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="bio"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <LoadingButton type="submit" loading={mutation.isPending}>
                  Save
                </LoadingButton>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface AvatarInputProps {
  src: string | StaticImageData;
  onImageCropped: (blob: Blob | null) => void;
}
function AvatarInput({ src, onImageCropped }: AvatarInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageToCrop, setImageToCrop] = useState<File>();

  const onImageSelect = (file: File | undefined) => {
    if (!file) {
      return;
    }
    Resizer.imageFileResizer(
      file,
      1024,
      1014,
      "webp",
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      "file",
    );
  };
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="sr-only hidden"
        onChange={(e) => onImageSelect(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative block"
      >
        <Image
          src={src}
          alt="Avatar preview"
          width={150}
          height={150}
          className="size-32 flex-none rounded-full object-cover inline-block"
        />
        <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black bg-opacity-30 text-white transition-colors duration-200 group-hover:bg-opacity-25">
          <Camera size={24} />
        </span>
      </button>
      {imageToCrop && (
        <CropImageDialog
          src={URL.createObjectURL(imageToCrop)}
          cropAspectRatio={1}
          onClose={() => {
            setImageToCrop(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
          onCropped={onImageCropped}
        />
      )}
    </>
  );
}
