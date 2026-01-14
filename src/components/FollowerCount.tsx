"use client"

import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";

interface FollowerCountProps {
  followerInfo: FollowerInfo;
  userId: string;
}

export default function FollowerCount({
  followerInfo,
  userId,
}: FollowerCountProps) {
  const { data } = useFollowerInfo(userId, followerInfo);
  return (
    <span>
      Followers: <span className="font-semibold">{data.followers}</span>
    </span>
  );
}
