import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
  }

  try {
    // In a real implementation, this would call the SecurityHeaders API
    // For now, we'll use our mock function from lib/api.ts
    const { fetchSecurityHeaders } = await import("@/lib/api")
    const data = await fetchSecurityHeaders(url)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching security headers:", error)
    return NextResponse.json({ error: "Failed to fetch security headers" }, { status: 500 })
  }
}
