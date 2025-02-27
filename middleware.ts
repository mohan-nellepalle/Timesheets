import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verify } from "jsonwebtoken"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    try {
      verify(token, process.env.JWT_SECRET!)
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // Redirect authenticated users from login page
  if (request.nextUrl.pathname === "/" && token) {
    try {
      verify(token, process.env.JWT_SECRET!)
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } catch {
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

