import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Fetch teams that have space (less than 5 members)
    const teams = await sql`
      SELECT t.id, t.name, t.created_at, COUNT(r.id) as member_count
      FROM teams t
      LEFT JOIN registrations r ON t.id = r.team_id
      GROUP BY t.id, t.name, t.created_at
      HAVING COUNT(r.id) < 5
      ORDER BY t.name ASC
    `

    return NextResponse.json(
      {
        success: true,
        teams,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("[v0] Failed to fetch teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams. Please try again." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    // Insert new team
    const result = await sql`
      INSERT INTO teams (name)
      VALUES (${name.trim()})
      RETURNING id, name, created_at
    `

    return NextResponse.json(
      {
        success: true,
        team: result[0],
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[v0] Failed to create team:", error)

    // Handle duplicate team name error
    if (error.code === "23505") {
      return NextResponse.json({ error: "A team with this name already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to create team. Please try again." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("id")

    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 })
    }

    // Delete team (cascade will delete associated registrations)
    await sql`
      DELETE FROM teams
      WHERE id = ${teamId}
    `

    return NextResponse.json(
      {
        success: true,
        message: "Team deleted successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("[v0] Failed to delete team:", error)
    return NextResponse.json({ error: "Failed to delete team. Please try again." }, { status: 500 })
  }
}
