import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col items-center justify-center gap-12 text-center">
          <div className="space-y-6">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-sans text-balance">AI Hackathon</h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Join us for an exciting AI Hackathon at Connect 2025. Build innovative AI solutions and connect with
              fellow developers.
            </p>
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white p-4 rounded-lg">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hackathon%20QR%20Code-LPbyWNNZwZjKlGnjKjjQARYcwr5QxE.png"
                alt="Registration QR Code"
                fill
                className="object-contain p-2"
                priority
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/hackathon-register">Register Now</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="text-lg px-8">
                <Link href="/hackathon-register">Scan QR Code</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 text-sm text-muted-foreground font-mono">Connect 2025 • Las Vegas</div>

        </div>
        <div className="mt-8 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 p-4">
          <Link href="/countdown" className="text-lg px-8 text-primary">
            Countdown
          </Link>
          <Link href="/list" className="text-lg px-8 text-primary">
            List
          </Link>
          <Link href="/assistant-ui-giveaway" className="text-lg px-8 text-primary">
            Assistant UI Giveaway
          </Link>
        </div>
      </div>
    </main>
  )
}
