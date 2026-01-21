"use client";

import kyInstance from "@/lib/ky";
import { NotificationsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useNotificationsInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/notifications",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<NotificationsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: false
  });
}
