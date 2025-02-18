"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between w-full">
      <Link href="/" className="flex items-center space-x-2">
        <BookOpen className="h-6 w-6" />
        <span className="font-bold">StudyMind</span>
      </Link>
      <div className="flex items-center ml-auto">
        <nav className="flex items-center space-x-6 text-sm">
          <Link
            href="/dashboard"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/chat"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === "/chat" ? "text-foreground" : "text-foreground/60"
            )}
          >
            Chat
          </Link>
          <Link
            href="/pricing"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === "/pricing" ? "text-foreground" : "text-foreground/60"
            )}
          >
            Pricing
          </Link>
        </nav>
      </div>
    </div>
  );
}