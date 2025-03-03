"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  onItemClick?: (name: string, url: string) => void
  onTryFreeClick?: () => void
}

export function NavBar({ items, className, onItemClick, onTryFreeClick }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleClick = (item: NavItem) => {
    setActiveTab(item.name)
    if (onItemClick) {
      onItemClick(item.name, item.url)
    }
  }

  return (
    <div
      className={cn(
        "fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-transparent",
        className,
      )}
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="flex items-center gap-5 backdrop-blur-lg py-3 px-3 rounded-full shadow-lg border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <button
              key={item.name}
              onClick={() => handleClick(item)}
              className={cn(
                "relative cursor-pointer text-base font-semibold px-8 py-3 rounded-full transition-colors",
                "text-foreground/80 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500",
                isActive && "bg-muted/50 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={22} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-t-full">
                    <div className="absolute w-14 h-7 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-10 h-7 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-5 h-5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-sm top-0 left-2.5" />
                  </div>
                </motion.div>
              )}
            </button>
          )
        })}
        
        {onTryFreeClick && (
          <Button 
            onClick={onTryFreeClick}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-full px-6 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105"
          >
            Try for Free
          </Button>
        )}
      </div>
    </div>
  )
} 