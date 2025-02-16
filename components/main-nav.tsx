"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <BookOpen className="h-6 w-6" />
        <span className="font-bold">StudyMind</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm">
        <Link
          href="/dashboard"
          className={cn(
            "transition-colors hover:text-white/80",
            pathname === "/dashboard" ? "text-white" : "text-white/60"
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/notes"
          className={cn(
            "transition-colors hover:text-white/80",
            pathname === "/notes" ? "text-white" : "text-white/60"
          )}
        >
          Notes
        </Link>
        <Link
          href="/chat"
          className={cn(
            "transition-colors hover:text-white/80",
            pathname === "/chat" ? "text-white" : "text-white/60"
          )}
        >
          Chat
        </Link>
        <Link
          href="/pricing"
          className={cn(
            "transition-colors hover:text-white/80",
            pathname === "/pricing" ? "text-white" : "text-white/60"
          )}
        >
          Pricing
        </Link>
      </nav>
    </div>
  );
} 