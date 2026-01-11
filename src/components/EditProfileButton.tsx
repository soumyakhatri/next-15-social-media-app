"use client";

import { UserData } from "@/lib/types";
import { useState } from "react";
import { Button } from "./ui/button";
import { EditProfileDialog } from "./EditProfileDialog";

interface EditProfileButtonProps {
  user: UserData;
}
export default function EditProfileButton({ user }: EditProfileButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <Button variant={"outline"} onClick={() => setDialogOpen(true)}>
        Edit Profile
      </Button>
      <EditProfileDialog open={dialogOpen} onOpenChange={setDialogOpen} user={user}/>
    </>
  );
}
