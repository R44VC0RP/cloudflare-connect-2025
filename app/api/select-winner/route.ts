import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get all registrations from the database
    const registrations = await sql`
      SELECT name, workplace 
      FROM registrations 
      ORDER BY created_at DESC
    `

    if (registrations.length === 0) {
      return NextResponse.json({ error: "No registrations found" }, { status: 404 })
    }

    // Randomly select a winner
    const randomIndex = Math.floor(Math.random() * registrations.length)
    const winner = registrations[randomIndex]

    return NextResponse.json({
      winner: {
        name: winner.name,
        workplace: winner.workplace || "Independent",
      },
    })
  } catch (error) {
    console.error("Error selecting winner:", error)
    return NextResponse.json({ error: "Failed to select winner" }, { status: 500 })
  }
}
