"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";

export default function SearchField() {
  const router =  useRouter()
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();
    router.push(`/search?q=${encodeURIComponent(q)}`)
  };

  return (
    //method and action are just for progressive enhancement(to make it work even without javascript)
    <form onSubmit={handleSubmit} method="GET" action="/search"> 
      <div className="relative">
        <Input name="q" placeholder="search" className="pe-10" />
        <SearchIcon className="absolute right-3 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground" />
      </div>
    </form>
  );
}
