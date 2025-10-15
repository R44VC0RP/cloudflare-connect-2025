"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export default function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [isTargetReached, setIsTargetReached] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const target = new Date()
      
      // Set target to 10:30 PM today
      target.setHours(22, 30, 0, 0)
      
      // If we're past 10:30 PM today, set target to 10:30 PM tomorrow
      if (now > target) {
        target.setDate(target.getDate() + 1)
      }
      
      const difference = target.getTime() - now.getTime()
      
      if (difference <= 0) {
        setIsTargetReached(true)
        return { hours: 0, minutes: 0, seconds: 0 }
      }
      
      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      
      return { hours, minutes, seconds }
    }

    // Calculate immediately
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatNumber = (num: number) => num.toString().padStart(2, '0')

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-6xl">
        <div className="text-center">
          {!isTargetReached ? (
            <div className="flex items-center justify-center gap-6 md:gap-12 lg:gap-16">
              <div className="flex flex-col items-center">
                <div className="text-8xl md:text-[12rem] lg:text-[16rem] font-sans text-primary leading-none">
                  {formatNumber(timeLeft.hours)}
                </div>
                <div className="text-2xl md:text-4xl lg:text-5xl text-muted-foreground mt-4 md:mt-8">
                  Hours
                </div>
              </div>
              
              <div className="text-8xl md:text-[12rem] lg:text-[16rem] font-sans text-primary leading-none">:</div>
              
              <div className="flex flex-col items-center">
                <div className="text-8xl md:text-[12rem] lg:text-[16rem] font-sans text-primary leading-none">
                  {formatNumber(timeLeft.minutes)}
                </div>
                <div className="text-2xl md:text-4xl lg:text-5xl text-muted-foreground mt-4 md:mt-8">
                  Minutes
                </div>
              </div>
              
              <div className="text-8xl md:text-[12rem] lg:text-[16rem] font-sans text-primary leading-none">:</div>
              
              <div className="flex flex-col items-center">
                <div className="text-8xl md:text-[12rem] lg:text-[16rem] font-sans text-primary leading-none">
                  {formatNumber(timeLeft.seconds)}
                </div>
                <div className="text-2xl md:text-4xl lg:text-5xl text-muted-foreground mt-4 md:mt-8">
                  Seconds
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <Clock className="w-32 h-32 md:w-48 md:h-48 text-primary animate-bounce" />
              </div>
              <p className="text-6xl md:text-8xl lg:text-9xl font-sans text-primary">
                It's 10:30 PM!
              </p>
              <p className="text-3xl md:text-4xl text-muted-foreground mt-8">
                The countdown has ended
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

