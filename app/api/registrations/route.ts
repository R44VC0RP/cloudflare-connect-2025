import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const registrations = await sql`
      SELECT 
        r.id, 
        r.name, 
        r.email, 
        r.workplace, 
        r.project_idea, 
        r.created_at,
        r.team_id,
        t.name as team_name
      FROM registrations r
      LEFT JOIN teams t ON r.team_id = t.id
      ORDER BY t.name ASC NULLS LAST, r.created_at DESC
    `

    return NextResponse.json(
      {
        success: true,
        registrations,
        count: registrations.length,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("[v0] Failed to fetch registrations:", error)

    return NextResponse.json({ error: "Failed to fetch registrations. Please try again." }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { memberId, teamId } = await request.json()

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 })
    }

    await sql`
      UPDATE registrations
      SET team_id = ${teamId || null}
      WHERE id = ${memberId}
    `

    return NextResponse.json(
      {
        success: true,
        message: "Member team updated successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("[v0] Failed to update member team:", error)
    return NextResponse.json({ error: "Failed to update member team. Please try again." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get("id")

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 })
    }

    await sql`
      DELETE FROM registrations
      WHERE id = ${memberId}
    `

    return NextResponse.json(
      {
        success: true,
        message: "Member deleted successfully",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("[v0] Failed to delete member:", error)
    return NextResponse.json({ error: "Failed to delete member. Please try again." }, { status: 500 })
  }
}
