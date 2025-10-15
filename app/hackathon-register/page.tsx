import { RegistrationForm } from "@/components/registration-form"

export default function HackathonRegister() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-sans text-balance">AI Hackathon Registration</h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Fill out the form below to register for the AI Hackathon at Connect 2025
              <br />
              <br />
              <span className="text-primary">
                Max Team Size is 5
              </span>
            </p>
          </div>

          <RegistrationForm />
        </div>
      </div>
    </main>
  )
}
