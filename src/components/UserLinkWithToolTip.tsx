"use client"

import UserTooltip from "./UserTooltip";
import { UserData } from "@/lib/types";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { HTTPError } from "ky";

interface UserLinkWithToolTipProps {
  username: string;
}
export default function UserLinkWithToolTip( {
  username,
}: UserLinkWithToolTipProps) {
  const { data } = useQuery({
    queryKey: ["user-data", username],
    queryFn: () =>
      kyInstance.get(`/api/users/username/${username}`).json<UserData>(),
    staleTime: Infinity,
    retry(failureCount, error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        return false;
      } else {
        return failureCount < 3;
      }
    },
  });

  if (!data) {
    return (
      <Link
        href={`/users/${username}`}
        className="text-primary hover:underline"
      >
        @{username}
      </Link>
    );
  }

  return (
    <UserTooltip user={data}>
      <Link
        href={`/users/${username}`}
        className="text-primary hover:underline"
      >
        @{username}
      </Link>
    </UserTooltip>
  );
}
