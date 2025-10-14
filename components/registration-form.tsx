"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Team {
  id: number
  name: string
}

export function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    workplace: "",
    projectIdea: "",
    teamOption: "none" as "none" | "existing" | "new",
    teamId: "",
    newTeamName: "",
  })
  const [teams, setTeams] = useState<Team[]>([])
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch("/api/teams")
        const data = await response.json()
        if (response.ok) {
          setTeams(data.teams)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch teams:", error)
      } finally {
        setLoadingTeams(false)
      }
    }
    fetchTeams()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          workplace: formData.workplace,
          projectIdea: formData.projectIdea,
          teamId: formData.teamOption === "existing" ? formData.teamId : null,
          newTeamName: formData.teamOption === "new" ? formData.newTeamName : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to register")
      }

      setSubmitStatus("success")
      setFormData({
        name: "",
        email: "",
        workplace: "",
        projectIdea: "",
        teamOption: "none",
        teamId: "",
        newTeamName: "",
      })

      if (formData.teamOption === "new") {
        const teamsResponse = await fetch("/api/teams")
        const teamsData = await teamsResponse.json()
        if (teamsResponse.ok) {
          setTeams(teamsData.teams)
        }
      }
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Registration Details</h2>
        <p className="text-muted-foreground mt-1">Fields marked with * are required</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workplace">Where do you work?</Label>
          <Input
            id="workplace"
            type="text"
            placeholder="Company name or organization"
            value={formData.workplace}
            onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectIdea">What are you planning on building?</Label>
          <Textarea
            id="projectIdea"
            placeholder="Describe your project idea..."
            value={formData.projectIdea}
            onChange={(e) => setFormData({ ...formData, projectIdea: e.target.value })}
            disabled={isSubmitting}
            rows={4}
          />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div>
            <Label className="text-base font-semibold">Team (Optional)</Label>
            <p className="text-sm text-muted-foreground mt-1">Join an existing team or create a new one</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamOption">Team Option</Label>
            <Select
              value={formData.teamOption}
              onValueChange={(value: "none" | "existing" | "new") =>
                setFormData({ ...formData, teamOption: value, teamId: "", newTeamName: "" })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id="teamOption">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No team (individual)</SelectItem>
                <SelectItem value="existing">Join existing team</SelectItem>
                <SelectItem value="new">Create new team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.teamOption === "existing" && (
            <div className="space-y-2">
              <Label htmlFor="teamId">Select Team</Label>
              {loadingTeams ? (
                <div className="text-sm text-muted-foreground">Loading teams...</div>
              ) : teams.length === 0 ? (
                <div className="text-sm text-muted-foreground">No teams available yet. Create a new team instead!</div>
              ) : (
                <Select
                  value={formData.teamId}
                  onValueChange={(value) => setFormData({ ...formData, teamId: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="teamId">
                    <SelectValue placeholder="Choose a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {formData.teamOption === "new" && (
            <div className="space-y-2">
              <Label htmlFor="newTeamName">New Team Name</Label>
              <Input
                id="newTeamName"
                type="text"
                placeholder="Enter team name"
                value={formData.newTeamName}
                onChange={(e) => setFormData({ ...formData, newTeamName: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        {submitStatus === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Registration successful! We look forward to seeing you at the hackathon.
            </AlertDescription>
          </Alert>
        )}

        {submitStatus === "error" && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Registering...
            </>
          ) : (
            "Register for Hackathon"
          )}
        </Button>
      </form>
    </div>
  )
}
