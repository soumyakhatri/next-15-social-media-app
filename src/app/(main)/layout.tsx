import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "./sessionProvider";
import Navbar from "./Navbar";
import MenuBar from "./MenuBar";
import { SocketProvider } from "../../../providers/SocketProvider";
import { SocketListenersProvider } from "../../../providers/SocketListenerProvider";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) redirect("/login");

  return (
    <SessionProvider value={session}>
      {/* 👇 Socket lives INSIDE client providers */}
      {/* we need to call SocketProvider only once. we cannot call SocketProvider in useEffect as this(Layout) is a server component */}
      {/* Layout is a server component therefore we are importing SocketProvider like this. */}
      {/* SocketProvider is using session info such as user id therefore it needs to be placed inside SessionProvider */}
      {/* Its job is to join this user to its room(create a room for the user) */}
      <SocketProvider />
      {/* SocketListenersProvider needs to be inside ReactQueryProvider(it is in root layout) as it is using queryClient inside it */}
      <SocketListenersProvider />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
          <MenuBar className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80" />
          {children}
        </div>
        <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
      </div>
    </SessionProvider>
  );
}
