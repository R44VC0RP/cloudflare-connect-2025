import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, workplace, projectIdea, teamId, newTeamName } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    let finalTeamId = teamId

    if (newTeamName && newTeamName.trim() !== "") {
      // Create new team
      try {
        const teamResult = await sql`
          INSERT INTO teams (name)
          VALUES (${newTeamName.trim()})
          RETURNING id
        `
        finalTeamId = teamResult[0].id
      } catch (error: any) {
        if (error.code === "23505") {
          return NextResponse.json({ error: "A team with this name already exists" }, { status: 409 })
        }
        throw error
      }
    }

    // Insert registration into database
    const result = await sql`
      INSERT INTO registrations (name, email, workplace, project_idea, team_id)
      VALUES (${name}, ${email}, ${workplace || null}, ${projectIdea || null}, ${finalTeamId || null})
      RETURNING id, name, email, created_at
    `

    return NextResponse.json(
      {
        success: true,
        registration: result[0],
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[v0] Registration error:", error)

    // Handle duplicate email error
    if (error.code === "23505") {
      return NextResponse.json({ error: "This email is already registered" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to register. Please try again." }, { status: 500 })
  }
}
