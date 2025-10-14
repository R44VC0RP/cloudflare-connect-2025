"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trophy, Sparkles } from "lucide-react"

interface Winner {
  name: string
  workplace: string
}

export default function AssistantUIGiveaway() {
  const [countdown, setCountdown] = useState(5)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [winner, setWinner] = useState<Winner | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (isCountingDown && countdown === 0) {
      selectWinner()
    }
  }, [countdown, isCountingDown])

  const selectWinner = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/select-winner")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to select winner")
      }

      setWinner(data.winner)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
      setIsCountingDown(false)
    }
  }

  const startGiveaway = () => {
    setWinner(null)
    setError("")
    setCountdown(5)
    setIsCountingDown(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="w-12 h-12 text-primary" />
              <h1 className="text-5xl md:text-7xl font-sans text-balance">Assistant-UI Giveaway</h1>
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <p className="text-lg text-muted-foreground text-pretty">
              One lucky hackathon participant will win an exclusive Assistant-UI prize!
            </p>
          </div>

          <Card className="border-2 shadow-none">
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                {isCountingDown && countdown > 0 && "Drawing Winner In..."}
                {isCountingDown && countdown === 0 && "Selecting Winner..."}
                {!isCountingDown && !winner && "Ready to Draw?"}
                {winner && "We Have a Winner!"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {isCountingDown && countdown > 0 && (
                <div className="flex items-center justify-center">
                  <div className="text-9xl font-sans text-primary animate-pulse">{countdown}</div>
                </div>
              )}

              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <Loader2 className="w-16 h-16 animate-spin text-primary" />
                  <p className="text-xl text-muted-foreground">Selecting a random winner...</p>
                </div>
              )}

              {winner && !isLoading && (
                <div className="space-y-6 py-8">
                  <div className="text-center space-y-4 animate-in fade-in duration-1000">
                    <div className="flex justify-center">
                      <Trophy className="w-24 h-24 text-primary animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl text-muted-foreground">Congratulations to</p>
                      <p className="text-5xl md:text-6xl font-sans text-primary">{winner.name}</p>
                      {winner.workplace && (
                        <p className="text-2xl text-muted-foreground">
                          from <span className="font-sans">{winner.workplace}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <p className="text-lg text-destructive">{error}</p>
                </div>
              )}

              {!isCountingDown && !isLoading && (
                <div className="flex justify-center">
                  <Button onClick={startGiveaway} size="lg" className="text-xl px-12 py-8">
                    {winner ? "Draw Another Winner" : "Start Giveaway"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
