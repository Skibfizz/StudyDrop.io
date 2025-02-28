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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/hooks/useAuth";
import { getAvatarGradient, getInitials } from "@/lib/avatar-utils";
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

export function UserNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/auth/signin">
          <Button variant="ghost" size="sm">Sign In</Button>
        </Link>
        <Link href="/auth/signup">
          <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/signin');
  };

  // Get user display info from Supabase user metadata
  const userMetadata = user.user_metadata || {};
  const displayName = userMetadata.full_name || userMetadata.username || user.email?.split('@')[0] || 'User';
  
  // Generate initials for the avatar
  const initials = getInitials(displayName);
  // We'll use the site's signature gradient directly
  // const gradient = getAvatarGradient(displayName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
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