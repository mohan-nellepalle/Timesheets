import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

if (!process.env.JWT_SECRET) {
  throw new Error("Please add your JWT secret to .env.local")
}

export async function POST(request: Request) {
  try {
    const token = cookies().get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verify(token, process.env.JWT_SECRET) as {
      userId: string
    }

    const { date, hoursWorked, description } = await request.json()

    const client = await clientPromise
    const db = client.db("timesheet")

    const timesheet = await db.collection("timesheets").insertOne({
      userId: new ObjectId(decoded.userId),
      date: new Date(date),
      hoursWorked: Number.parseFloat(hoursWorked),
      description,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true, timesheetId: timesheet.insertedId })
  } catch (error) {
    console.error("Timesheet submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const token = cookies().get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verify(token, process.env.JWT_SECRET) as {
      userId: string
    }

    const client = await clientPromise
    const db = client.db("timesheet")

    const timesheets = await db
      .collection("timesheets")
      .find({ userId: new ObjectId(decoded.userId) })
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json(timesheets)
  } catch (error) {
    console.error("Timesheet fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

