import PostEditor from "@/components/posts/editor/PostEditor";
import prisma from "@/lib/prisma";

export default async function Home() {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
          avatar: true
        }
      }
    }
  })

  return (
    <main className="h-[200vh] w-full">
      <div className="w-full"></div>
      <PostEditor />
    </main>
  );
}
