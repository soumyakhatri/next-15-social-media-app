import Link from "next/link";
import LoginForm from "./LoginForm";
import Image from "next/image";
import loginImage from "@/assets/login-image.jpg";

export default function LoginPage() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <h1 className="text-center text-3xl font-bold">Login to earbook</h1>
          <div className="space-y-5">
            <LoginForm />
            <Link href="/signup" className="block text-center hover:underline">
              Don&apos;t have an account? Sign Up
            </Link>
          </div>
        </div>
        <Image src={loginImage} alt="login" className="hidden w-1/2 md:block object-cover" />
      </div>
    </main>
  );
}
