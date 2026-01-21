"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// Step 1 of setting up websocket
// we just want a single instance of socket.
// we create it inside this function and call this function where ever we have to use socket.
export const getSocket = () => {
  if (!socket) {
    // establishing connection with the websockets
    socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
      // withCredentials: true,
      transports: ["websocket"],
    });
    console.log("🟢 socket created");
  }
  return socket;
};
