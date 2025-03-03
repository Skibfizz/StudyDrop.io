"use client"

import { LayoutGroup, motion } from "motion/react"

import { TextRotate } from "@/components/ui/text-rotate"
import { cn } from "@/lib/utils"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { AvatarCircles } from "@/components/ui/avatar-circles"

function Preview() {
  return (
    <div className="w-full h-full text-2xl sm:text-3xl md:text-5xl flex flex-row items-center justify-center font-overusedGrotesk bg-white dark:text-muted text-foreground font-light overflow-hidden p-12 sm:p-20 md:p-24">
      <LayoutGroup>
        <motion.p className="flex whitespace-pre" layout>
          <motion.span
            className="pt-0.5 sm:pt-1 md:pt-2"
            layout
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          >
            Make it{" "}
          </motion.span>
          <TextRotate
            texts={[
              "work!",
              "fancy ✽",
              "right",
              "fast",
              "fun",
              "rock",
              "🕶️🕶️🕶️",
            ]}
            mainClassName="text-white px-2 sm:px-2 md:px-3 bg-[#ff5941] overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
        </motion.p>
      </LayoutGroup>
    </div>
  )
}

export function AnimatedGridPatternDemo() {
  return (
    <div className="relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-20 md:shadow-xl">
      <p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-black dark:text-white">
        Animated Grid Pattern
      </p>
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
        )}
      />
    </div>
  )
}

export function RainbowButtonDemo() {
  return <RainbowButton>Get Unlimited Access</RainbowButton>;
}

export function AvatarCirclesDemo() {
  const avatarUrls = [
    "https://avatars.githubusercontent.com/u/16860528",
    "https://avatars.githubusercontent.com/u/20110627",
    "https://avatars.githubusercontent.com/u/106103625",
    "https://avatars.githubusercontent.com/u/59228569",
  ]

  return <AvatarCircles numPeople={99} avatarUrls={avatarUrls} />
}

export { Preview } 