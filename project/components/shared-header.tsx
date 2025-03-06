"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/hooks/useAuth";

export function SharedHeader() {
  const { user, loading } = useAuth();

  return (
    <header className="w-full theme-header shared-header">
      <div className="flex h-14 items-center px-6">
        <MainNav />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
} 