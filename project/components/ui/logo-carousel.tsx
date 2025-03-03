"use client"

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type SVGProps,
} from "react"
import { AnimatePresence, motion } from "framer-motion"

interface Logo {
  name: string
  id: number
  img: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

interface LogoColumnProps {
  logos: Logo[]
  index: number
  currentTime: number
}

// Enhanced shuffling function with better randomization
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Use a more complex random number to avoid patterns
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Distribute logos with enhanced randomization
const distributeLogos = (allLogos: Logo[], columnCount: number): Logo[][] => {
  // First shuffle
  const shuffled = shuffleArray(allLogos)
  const columns: Logo[][] = Array.from({ length: columnCount }, () => [])

  // Distribute logos to columns in a random order
  shuffled.forEach((logo, index) => {
    columns[index % columnCount].push(logo)
  })

  // Ensure each column has the same number of logos
  const maxLength = Math.max(...columns.map((col) => col.length))
  
  // Fill shorter columns with random logos, ensuring no consecutive duplicates
  columns.forEach((col) => {
    while (col.length < maxLength) {
      // Get a random logo that's different from the last one in the column
      let randomLogo
      do {
        randomLogo = shuffled[Math.floor(Math.random() * shuffled.length)]
      } while (col.length > 0 && col[col.length - 1].id === randomLogo.id)
      
      col.push(randomLogo)
    }
  })

  // Shuffle each column again for extra randomness
  return columns.map(column => shuffleArray(column))
}

const LogoColumn: React.FC<LogoColumnProps> = React.memo(
  ({ logos, index, currentTime }) => {
    const cycleInterval = 2000
    const columnDelay = index * 200
    const adjustedTime = (currentTime + columnDelay) % (cycleInterval * logos.length)
    const currentIndex = Math.floor(adjustedTime / cycleInterval)
    const CurrentLogo = useMemo(() => logos[currentIndex].img, [logos, currentIndex])

    return (
      <motion.div
        className="relative h-[80px] w-[160px] overflow-hidden md:h-[80px] md:w-[160px]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.1,
          duration: 0.5,
          ease: "easeOut",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${logos[currentIndex].id}-${currentIndex}`}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: "10%", opacity: 0, filter: "blur(8px)" }}
            animate={{
              y: "0%",
              opacity: 1,
              filter: "blur(0px)",
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
                mass: 1,
                bounce: 0.2,
                duration: 0.5,
              },
            }}
            exit={{
              y: "-20%",
              opacity: 0,
              filter: "blur(6px)",
              transition: {
                type: "tween",
                ease: "easeIn",
                duration: 0.3,
              },
            }}
          >
            <CurrentLogo className="h-full w-full" />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    )
  }
)

interface LogoCarouselProps {
  columnCount?: number
  logos: Logo[]
}

export function LogoCarousel({ columnCount = 2, logos }: LogoCarouselProps) {
  const [logoSets, setLogoSets] = useState<Logo[][]>([])
  const [currentTime, setCurrentTime] = useState(0)

  const updateTime = useCallback(() => {
    setCurrentTime((prevTime) => prevTime + 100)
  }, [])

  useEffect(() => {
    const intervalId = setInterval(updateTime, 100)
    return () => clearInterval(intervalId)
  }, [updateTime])

  // Reshuffle logos periodically to ensure randomness
  useEffect(() => {
    const distributedLogos = distributeLogos(logos, columnCount)
    setLogoSets(distributedLogos)
    
    // Reshuffle logos every 30 seconds
    const reshuffleInterval = setInterval(() => {
      const newDistributedLogos = distributeLogos(logos, columnCount)
      setLogoSets(newDistributedLogos)
    }, 30000)
    
    return () => clearInterval(reshuffleInterval)
  }, [logos, columnCount])

  return (
    <div className="flex items-center justify-center gap-8">
      {logoSets.map((logos, index) => (
        <LogoColumn
          key={index}
          logos={logos}
          index={index}
          currentTime={currentTime}
        />
      ))}
    </div>
  )
}

export { LogoColumn }; 