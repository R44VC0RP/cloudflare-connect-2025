"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Users, Plus } from "lucide-react"

interface Registration {
  id: number
  name: string
  email: string
  workplace: string | null
  project_idea: string | null
  created_at: string
  team_id: number | null
  team_name: string | null
}

interface TeamGroup {
  teamId: number | null
  teamName: string
  members: Registration[]
}

interface Team {
  id: number
  name: string
}

export default function ListPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: "member" | "team" | null
    id: number | null
    name: string
  }>({
    open: false,
    type: null,
    id: null,
    name: "",
  })
  const [deleting, setDeleting] = useState(false)
  const [updatingMember, setUpdatingMember] = useState<number | null>(null)
  const [createTeamDialog, setCreateTeamDialog] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [createTeamError, setCreateTeamError] = useState<string | null>(null)

  const fetchRegistrations = async () => {
    try {
      const response = await fetch("/api/registrations")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch registrations")
      }

      setRegistrations(data.registrations)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams")
      const data = await response.json()

      if (response.ok) {
        setTeams(data.teams || [])
      }
    } catch (err: any) {
      console.error("Failed to fetch teams:", err)
    }
  }

  useEffect(() => {
    fetchRegistrations()
    fetchTeams()
  }, [])

  const groupedByTeam: TeamGroup[] = registrations.reduce((acc: TeamGroup[], reg) => {
    const existingGroup = acc.find((g) => g.teamId === reg.team_id)
    if (existingGroup) {
      existingGroup.members.push(reg)
    } else {
      acc.push({
        teamId: reg.team_id,
        teamName: reg.team_name || "Individual Participants",
        members: [reg],
      })
    }
    return acc
  }, [])

  groupedByTeam.sort((a, b) => {
    if (a.teamId === null) return 1
    if (b.teamId === null) return -1
    return a.teamName.localeCompare(b.teamName)
  })

  const handleDeleteMember = async () => {
    if (!deleteDialog.id) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/registrations?id=${deleteDialog.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete member")
      }

      await fetchRegistrations()
      setDeleteDialog({ open: false, type: null, id: null, name: "" })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteTeam = async () => {
    if (!deleteDialog.id) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/teams?id=${deleteDialog.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete team")
      }

      await fetchRegistrations()
      setDeleteDialog({ open: false, type: null, id: null, name: "" })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleTeamChange = async (memberId: number, newTeamId: string) => {
    setUpdatingMember(memberId)
    try {
      const response = await fetch("/api/registrations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
          teamId: newTeamId === "none" ? null : Number.parseInt(newTeamId),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update member team")
      }

      await fetchRegistrations()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdatingMember(null)
    }
  }

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      setCreateTeamError("Team name is required")
      return
    }

    setCreatingTeam(true)
    setCreateTeamError(null)

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newTeamName.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create team")
      }

      await fetchTeams()
      setCreateTeamDialog(false)
      setNewTeamName("")
    } catch (err: any) {
      setCreateTeamError(err.message)
    } finally {
      setCreatingTeam(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Registered Participants</h1>
            <p className="text-muted-foreground">
              {loading ? "Loading..." : `${registrations.length} people registered for Connect 2025`}
            </p>
          </div>
          <Dialog open={createTeamDialog} onOpenChange={setCreateTeamDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>Add a new team that participants can join.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    placeholder="Enter team name"
                    value={newTeamName}
                    onChange={(e) => {
                      setNewTeamName(e.target.value)
                      setCreateTeamError(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !creatingTeam) {
                        handleCreateTeam()
                      }
                    }}
                  />
                </div>
                {createTeamError && <p className="text-sm text-destructive">{createTeamError}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateTeamDialog(false)} disabled={creatingTeam}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam} disabled={creatingTeam}>
                  {creatingTeam ? "Creating..." : "Create Team"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, j) => (
                    <Card key={j}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">No registrations yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {groupedByTeam.map((group) => (
              <div key={group.teamId || "individual"} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {group.teamId && <Users className="h-6 w-6 text-primary" />}
                    <h2 className="text-2xl font-bold">{group.teamName}</h2>
                    <Badge variant="secondary" className="text-sm">
                      {group.members.length} {group.members.length === 1 ? "member" : "members"}
                    </Badge>
                  </div>
                  {group.teamId && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          type: "team",
                          id: group.teamId,
                          name: group.teamName,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Team
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.members.map((member) => (
                    <Card key={member.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{member.name}</CardTitle>
                            <CardDescription className="mt-1">{member.email}</CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                type: "member",
                                id: member.id,
                                name: member.name,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Team</p>
                          <Select
                            value={member.team_id?.toString() || "none"}
                            onValueChange={(value) => handleTeamChange(member.id, value)}
                            disabled={updatingMember === member.id}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Team (Individual)</SelectItem>
                              {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id.toString()}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {member.workplace && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Workplace</p>
                            <p className="text-sm">{member.workplace}</p>
                          </div>
                        )}
                        {member.project_idea && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Project Idea</p>
                            <p className="text-sm line-clamp-3">{member.project_idea}</p>
                          </div>
                        )}
                        <div className="pt-2 border-t">
                          <Badge variant="secondary" className="text-xs">
                            {formatDate(member.created_at)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !deleting && setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteDialog.type === "team" ? "Delete Team" : "Delete Member"}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === "team"
                ? `Are you sure you want to delete the team "${deleteDialog.name}"? This will also remove all members from this team. This action cannot be undone.`
                : `Are you sure you want to delete ${deleteDialog.name}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteDialog.type === "team" ? handleDeleteTeam : handleDeleteMember}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
