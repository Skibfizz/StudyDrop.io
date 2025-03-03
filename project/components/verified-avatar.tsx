"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/code";
import { getInitials } from "@/lib/avatar-utils";

interface VerifiedAvatarProps {
  name: string;
  isVerified?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function VerifiedAvatar({
  name,
  isVerified = true,
  className = "",
  size = "md",
}: VerifiedAvatarProps) {
  const initials = getInitials(name);
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-24 w-24",
  };
  
  const badgeSizes = {
    sm: "w-4 h-4 -end-0.5 -top-0.5",
    md: "w-5 h-5 -end-1 -top-1",
    lg: "w-8 h-8 -end-2 -top-2",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-2xl",
  };

  return (
    <div className={`relative ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarFallback className={`bg-gradient-to-br from-purple-500 to-blue-500 text-white font-medium ${textSizes[size]}`}>
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {isVerified && (
        <span className={`absolute ${badgeSizes[size]}`}>
          <span className="sr-only">Verified</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              className="fill-background"
              d="M3.046 8.277A4.402 4.402 0 0 1 8.303 3.03a4.4 4.4 0 0 1 7.411 0 4.397 4.397 0 0 1 5.19 3.068c.207.713.23 1.466.067 2.19a4.4 4.4 0 0 1 0 7.415 4.403 4.403 0 0 1-3.06 5.187 4.398 4.398 0 0 1-2.186.072 4.398 4.398 0 0 1-7.422 0 4.398 4.398 0 0 1-5.257-5.248 4.4 4.4 0 0 1 0-7.437Z"
            />
            <path
              className="fill-primary"
              d="M4.674 8.954a3.602 3.602 0 0 1 4.301-4.293 3.6 3.6 0 0 1 6.064 0 3.598 3.598 0 0 1 4.3 4.302 3.6 3.6 0 0 1 0 6.067 3.6 3.6 0 0 1-4.29 4.302 3.6 3.6 0 0 1-6.074 0 3.598 3.598 0 0 1-4.3-4.293 3.6 3.6 0 0 1 0-6.085Z"
            />
            <path
              className="fill-background"
              d="M15.707 9.293a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 1 1 1.414-1.414L11 12.586l3.293-3.293a1 1 0 0 1 1.414 0Z"
            />
          </svg>
        </span>
      )}
    </div>
  );
} 