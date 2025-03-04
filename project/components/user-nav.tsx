"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/hooks/useAuth";
import { getInitials } from "@/lib/avatar-utils";
import { 
  User, 
  Settings, 
  LogOut,
  Crown,
  LayoutDashboard,
  LifeBuoy
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VerifiedAvatar } from "@/components/verified-avatar";

export function UserNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    return null; // Return nothing if user is not logged in
  }

  const handleSignOut = async () => {
    console.log("UserNav: handleSignOut called");
    await signOut();
    console.log("UserNav: signOut completed, no additional redirect needed");
    // The signOut function already handles the redirect, so we don't need to do it here
  };

  // Get user display info from Supabase user metadata
  const userMetadata = user.user_metadata || {};
  const displayName = userMetadata.full_name || userMetadata.username || user.email?.split('@')[0] || 'User';
  
  // We don't need to generate initials here anymore as the VerifiedAvatar component will do it

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 mt-2">
          <VerifiedAvatar 
            name={displayName} 
            size="sm"
            isVerified={true}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/profile')}>
            <User className="mr-2 h-4 w-4 text-gray-500" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/pricing')}>
            <Crown className="mr-2 h-4 w-4 text-purple-500" />
            <span>Upgrade Plan</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-blue-500" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/support')}>
            <LifeBuoy className="mr-2 h-4 w-4 text-green-500" />
            <span>Support</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <Settings className="mr-2 h-4 w-4 text-gray-500" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4 text-red-500" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}