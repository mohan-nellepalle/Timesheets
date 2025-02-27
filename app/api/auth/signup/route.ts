import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import clientPromise from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    const client = await clientPromise
    const db = client.db("timesheet")

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create new user
    const user = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      role: "user", // Default role
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      userId: user.insertedId,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

