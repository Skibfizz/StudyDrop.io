'use client';

import { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface StarRatingProps {
  totalStars?: number;
  defaultValue?: number;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function StarRating({ 
  totalStars = 5, 
  defaultValue = 0,
  onRate,
  size = 'md',
  className,
  disabled = false,
}: StarRatingProps) {
  const [rating, setRating] = useState(defaultValue);
  const [hover, setHover] = useState(0);

  const handleRating = (star: number) => {
    if (disabled) return;
    setRating(star);
    onRate?.(star);
  };

  const starSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  // Function to determine if a star should be full, half, or empty
  const getStarType = (position: number) => {
    const value = hover || rating;
    if (value >= position) return 'full';
    if (value >= position - 0.5) return 'half';
    return 'empty';
  };

  return (
    <div className={cn(
      "flex items-center gap-2",
      disabled && "opacity-80", // Reduced opacity to make colors more vibrant
      className
    )}>
      {Array.from({ length: totalStars }, (_, index) => index + 1).map((position) => {
        const starType = getStarType(position);
        
        return (
          <motion.button
            key={position}
            type="button"
            className={cn(
              "relative focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-ring focus-visible:ring-offset-2",
              disabled && "cursor-not-allowed"
            )}
            onClick={() => handleRating(position)}
            onMouseEnter={() => !disabled && setHover(position)}
            onMouseLeave={() => !disabled && setHover(0)}
            whileHover={!disabled ? { scale: 1.3, rotate: -10 } : undefined}
            whileTap={!disabled ? { scale: 0.9, rotate: 15 } : undefined}
            disabled={disabled}
          >
            <motion.div
              className={cn(
                "transition-colors duration-300",
                starType !== 'empty' 
                  ? "text-yellow-500 dark:text-yellow-400" // Stronger yellow color
                  : "text-gray-300 dark:text-gray-600" // More visible empty star
              )}
              initial={{ scale: 1 }}
              animate={{
                scale: starType !== 'empty' ? 1.2 : 1,
              }}
              transition={{ 
                duration: 0.3,
                ease: "easeOut"
              }}
            >
              {starType === 'half' ? (
                <StarHalf 
                  className={cn(
                    starSizes[size],
                    "fill-current stroke-[1.5px]"
                  )} 
                />
              ) : (
                <Star 
                  className={cn(
                    starSizes[size],
                    "fill-current stroke-[1.5px]"
                  )} 
                />
              )}
            </motion.div>
          </motion.button>
        );
      })}
    </div>
  );
} 