export const notifyUserCreated  = async (
  receiverId: string,
  notification: any
) => {
  await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/notify/insert-notification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      receiverId,
      notification,
    }),
  });
};

export const notifyUserDeleted  = async (
  receiverId: string,
  notificationId: string
) => {
  await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/notify/delete-notification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      receiverId,
      notificationId,
    }),
  });
};
