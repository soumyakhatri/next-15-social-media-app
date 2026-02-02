import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../../../../lib-client/socket";
import { useEffect } from "react";
import { NotificationsPage } from "@/lib/types";

// socket is already on. connection is already made.
// Here the client listens for the notification event and executes handleNotification when the event is received.
// in other words
// An event listener is registered on the socket to handle incoming notification events.
export function useNotificationSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    // here we handle what we need to do with the notification payload received from websocket
    const handleNotification = (notification: any) => {
      queryClient.setQueryData<InfiniteData<NotificationsPage, string | null>>(
        ["notifications"],
        (oldData) => {
          if (!oldData) {
            return {
              pageParams: [null],
              pages: [
                {
                  nextCursor: null,
                  notifications: [notification],
                },
              ],
            };
          }

          const firstPage = oldData.pages[0];

          // prevent duplicate notification insertion
          const alreadyExists = firstPage.notifications.some(
            (n) => n.id === notification.id
          );

          if (alreadyExists) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: [
              {
                ...firstPage,
                notifications: [notification, ...firstPage.notifications],
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      );

      // optional: keep this only if unread count is NOT updated via socket
      queryClient.invalidateQueries({
        queryKey: ["unread-notification-count"],
        // refetchType: "inactive",
      });
    };

    const handleDeleteNotification = (notificationId: string) => {
      queryClient.setQueryData<InfiniteData<NotificationsPage, string | null>>(
        ["notifications"],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              notifications: page.notifications.filter(
                (notification) => notification.id !== notificationId
              ),
            })),
            pageParams: oldData.pageParams,
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: ["unread-notification-count"],
        // refetchType: "inactive",
      });
    };

    const attachListeners = () => {
      socket.on("notification", handleNotification);
      socket.on("delete-notification", handleDeleteNotification);
    };

    // handle already-connected socket
    if (socket.connected) {
      attachListeners();
    } else {
      // whenever connection is made it will register the listeners.
      // handles reconnect
      socket.on("connect", attachListeners);
    }

    return () => {
      socket.off("connect", attachListeners);
      socket.off("notification", handleNotification);
      socket.off("delete-notification", handleDeleteNotification);
    };
  }, [queryClient]);
}
