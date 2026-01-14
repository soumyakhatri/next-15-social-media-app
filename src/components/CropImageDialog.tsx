import React, { useRef } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface CropImageDialogProps {
  src: string;
  cropAspectRatio: number;
  onClose: () => void;
  onCropped: (blob: Blob | null) => void;
}

export default function CropImageDialog({
  src,
  cropAspectRatio,
  onClose,
  onCropped,
}: CropImageDialogProps) {
  const cropperRef = useRef<ReactCropperElement>(null);

  const onCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    cropper?.getCroppedCanvas().toBlob((blob) => {
      if (blob) {
        onCropped(blob);
      }
    }, "image/webp");
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <Cropper
          src={src}
          style={{ height: 400, width: "100%" }}
          // Cropper.js options
          initialAspectRatio={cropAspectRatio}
          guides={false}
          //   crop={onCrop}
          ref={cropperRef}
          className="mx-auto size-fit"
        />
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onCrop}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
