"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function UserNav() {
  return (
    <div className="flex items-center gap-4">
      <Link href="/login">
        <Button variant="ghost" className="text-white/60 hover:text-white">
          Log in
        </Button>
      </Link>
      <Link href="/signup">
        <Button className="bg-white text-black hover:bg-white/90">
          Sign up
        </Button>
      </Link>
    </div>
  );
} 