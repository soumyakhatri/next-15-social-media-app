"use client";

import { useSession } from "@/app/(main)/sessionProvider";
import { useEffect } from "react";
import { getSocket } from "../lib-client/socket";

// Step 2 of websocket notification feature
export function SocketProvider() {
  const { user } = useSession();

  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();

    // here we emit an event called join.
    // all the logged in user will emit this event.
    // in the websocket backend we will catch this event and then create a room for this user
    const joinRoom = () => {
      console.log("🟢 joining room:", user.id);
      socket.emit("join", user.id);
    };

    // always listen first
    // When a connect event happens in the future, call joinRoom.
    // registers listener
    socket.on("connect", joinRoom);

    // then handle already-connected socket
    if (socket.connected) {
      joinRoom(); // runs immediately
    }

    return () => {
      socket.off("connect", joinRoom);
    };
  }, [user?.id]);

  return null;
}
