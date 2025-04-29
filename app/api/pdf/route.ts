import { type NextRequest, NextResponse } from "next/server"
import type { SecurityData } from "@/lib/generate-pdf"
import { generateSimplePDF } from "@/lib/generate-simple-pdf"

export async function POST(request: NextRequest) {
  try {
    const data: SecurityData = await request.json()

    if (!data || !data.url) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const doc = generateSimplePDF(data)
    const pdfBytes = doc.output("arraybuffer")

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="security-report-${data.url.replace(/[^a-zA-Z0-9]/g, "-")}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
