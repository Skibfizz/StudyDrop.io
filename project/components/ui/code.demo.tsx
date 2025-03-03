"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

import { Particles } from "@/components/ui/particles"
import { Footerdemo } from "@/components/ui/footer-section"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/code"
import { StarRating } from "@/components/ui/star-rating"

export function ParticlesDemo() {
  const { theme } = useTheme()
  const [color, setColor] = useState("#ffffff")

  useEffect(() => {
    setColor(theme === "dark" ? "#ffffff" : "#000000")
  }, [theme])

  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
      <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
        Particles
      </span>
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color={color}
        refresh
      />
    </div>
  )
}

function Footer() {
  return (
    <div className="block">
      <Footerdemo />
    </div>
  )
}

function Component() {
  return (
    <div className="relative">
      <Avatar>
        <AvatarImage src="https://originui.com/avatar-80-07.jpg" alt="Kelly King" />
        <AvatarFallback>KK</AvatarFallback>
      </Avatar>
      <span className="absolute -end-1 -top-1">
        <span className="sr-only">Verified</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
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
    </div>
  );
}

function DefaultRating() {
  return (
    <div className="space-y-2 text-center">
      <StarRating 
        defaultValue={3}
        onRate={(rating) => console.log(`Rated: ${rating}`)}
      />
    </div>
  )
}

function SmallRating() {
  return (
    <div className="space-y-2 text-center">
      <h3 className="font-medium">Small Rating</h3>
      <StarRating 
        size="sm"
        onRate={(rating) => console.log(`Rated: ${rating}`)}
      />
    </div>
  )
}

function LargeRating() {
  return (
    <div className="space-y-2 text-center">
      <h3 className="font-medium">Large Rating</h3>
      <StarRating 
        size="lg"
        totalStars={10}
        onRate={(rating) => console.log(`Rated: ${rating}`)}
      />
    </div>
  )
}

function DisabledRating() {
  return (
    <div className="space-y-2 text-center">
      <h3 className="font-medium">Disabled Rating</h3>
      <StarRating 
        defaultValue={4}
        disabled
      />
    </div>
  )
}

export { Footer, Component, DefaultRating, SmallRating, LargeRating, DisabledRating } 