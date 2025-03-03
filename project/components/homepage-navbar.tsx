"use client"

import { useEffect, useState } from "react"
import { Home, Star, DollarSign } from "lucide-react"
import { NavBar } from "@/components/ui/tubelight-navbar"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"

export function HomepageNavbar() {
  const router = useRouter()
  
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  const navItems = [
    { name: "Reviews", url: "#", icon: Star },
    { name: "Features", url: "#", icon: Home },
    { name: "Pricing", url: "/pricing", icon: DollarSign }
  ]

  const handleNavClick = (name: string, url: string) => {
    if (name === "Reviews") {
      scrollToSection("reviews-section")
      return
    }
    
    if (name === "Features") {
      scrollToSection("features-section")
      return
    }
    
    // For Pricing or any other external page
    router.push(url)
  }
  
  const handleTryFreeClick = () => {
    router.push('/auth/signin')
  }

  return (
    <header className="fixed top-6 z-50 w-full transparent-header" style={{ backgroundColor: 'transparent', backdropFilter: 'none' }}>
      <div className="flex h-24 items-center px-6 justify-center transparent-header" style={{ backgroundColor: 'transparent' }}>
        <div className="absolute left-6 hidden md:flex items-center">
          {/* You can add a logo here if needed */}
        </div>
        <NavBar 
          items={navItems} 
          className="mt-0"
          onItemClick={handleNavClick}
          onTryFreeClick={handleTryFreeClick}
        />
        <div className="absolute right-6 hidden md:flex items-center space-x-4 mt-0">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
} 