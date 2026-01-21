"use client";

import { useNotificationSocket } from "@/app/(main)/notifications/useNotificationSocket";

export function SocketListenersProvider() {
  useNotificationSocket(); // ✅ ONLY HERE
  return null;
}
