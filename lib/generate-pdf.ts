import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { addFont } from "@/lib/pdf-fonts"

// Extend the jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface SecurityData {
  url: string
  overallGrade: string
  headersData: {
    grade: string
    headers: Record<string, boolean>
    score: number
  }
  sslData: {
    grade: string
    details: Record<string, boolean>
    score: number
  }
  recommendations: Array<{
    title: string
    description: string
    priority: "High" | "Medium" | "Low"
  }>
}

export function generatePDF(data: SecurityData): jsPDF {
  // Create a new PDF document
  const doc = new jsPDF()

  // Add custom fonts
  addFont(doc)

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin

  // Set vibrant colors
  const primaryColor = [90, 50, 234] // Vibrant purple
  const secondaryColor = [255, 71, 166] // Vibrant pink
  const accentColor = [0, 186, 255] // Vibrant blue

  // Add title with gradient background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.roundedRect(margin, margin, contentWidth, 30, 5, 5, "F")

  doc.setFont("Montserrat", "bold")
  doc.setFontSize(24)
  doc.setTextColor(255, 255, 255)
  doc.text("CYBER AUDIT SECURITY REPORT", pageWidth / 2, margin + 18, { align: "center" })

  // Add URL and date
  doc.setFont("Montserrat", "normal")
  doc.setFontSize(12)
  doc.setTextColor(80, 80, 80)
  doc.text(`Website: ${data.url}`, pageWidth / 2, margin + 40, { align: "center" })
  doc.text(
    `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    pageWidth / 2,
    margin + 48,
    { align: "center" },
  )

  // Add overall score section with vibrant design
  const scoreBoxY = margin + 60
  const scoreBoxHeight = 80

  // Draw score box with gradient
  doc.setFillColor(...getGradeBackgroundColor(data.overallGrade))
  doc.roundedRect(margin, scoreBoxY, contentWidth, scoreBoxHeight, 5, 5, "F")

  // Add score title
  doc.setFont("Montserrat", "bold")
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text("OVERALL SECURITY SCORE", margin + 15, scoreBoxY + 20)

  // Add score grade
  doc.setFontSize(48)
  doc.text(data.overallGrade, margin + 50, scoreBoxY + 60)

  // Add score description
  doc.setFont("Montserrat", "normal")
  doc.setFontSize(12)
  doc.text(getScoreDescription(data.overallGrade), margin + 80, scoreBoxY + 40, {
    maxWidth: contentWidth - 100,
    align: "left",
  })

  // Add summary section
  const summaryY = scoreBoxY + scoreBoxHeight + 20
  doc.setFont("Montserrat", "bold")
  doc.setFontSize(16)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text("EXECUTIVE SUMMARY", margin, summaryY)

  doc.setFont("Montserrat", "normal")
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(
    `This report provides a comprehensive security assessment of ${data.url}. The assessment evaluates the website's security posture based on HTTP security headers and SSL/TLS implementation.`,
    margin,
    summaryY + 10,
    { maxWidth: contentWidth },
  )

  // Add score breakdown
  const scoreBreakdownY = summaryY + 30

  // Headers score
  drawScoreBox(
    doc,
    margin,
    scoreBreakdownY,
    contentWidth / 2 - 5,
    50,
    "HEADERS SCORE",
    data.headersData.grade,
    data.headersData.score,
  )

  // SSL score
  drawScoreBox(
    doc,
    margin + contentWidth / 2 + 5,
    scoreBreakdownY,
    contentWidth / 2 - 5,
    50,
    "SSL SCORE",
    data.sslData.grade,
    data.sslData.score,
  )

  // Security Headers Analysis
  const headersY = scoreBreakdownY + 70
  doc.setFont("Montserrat", "bold")
  doc.setFontSize(16)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text("SECURITY HEADERS ANALYSIS", margin, headersY)

  doc.setFont("Montserrat", "normal")
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(
    "HTTP security headers are directives that your web server can send to the browser to improve security. They help mitigate common web vulnerabilities.",
    margin,
    headersY + 10,
    { maxWidth: contentWidth },
  )

  // Headers table
  const headersTableData = Object.entries(data.headersData.headers).map(([header, present]) => [
    formatHeaderName(header),
    present ? "Present" : "Missing",
    getHeaderDescription(header),
  ])

  doc.autoTable({
    startY: headersY + 20,
    head: [["Header", "Status", "Description"]],
    body: headersTableData,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 11,
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: "bold" },
      1: { cellWidth: 40, halign: "center" },
      2: { cellWidth: contentWidth - 110 },
    },
    styles: {
      overflow: "linebreak",
      font: "Montserrat",
      fontSize: 10,
    },
    bodyStyles: {
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 255],
    },
    // Add custom styling for present/missing status
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        const cell = data.cell
        const text = cell.text[0]
        const doc = data.doc
        const statusX = cell.x + cell.width / 2
        const statusY = cell.y + cell.height / 2 + 1

        if (text === "Present") {
          doc.setFillColor(39, 174, 96) // Green
        } else {
          doc.setFillColor(231, 76, 60) // Red
        }

        doc.roundedRect(cell.x + 5, cell.y + 3, cell.width - 10, cell.height - 6, 2, 2, "F")
        doc.setTextColor(255, 255, 255)
        doc.text(text, statusX, statusY, { align: "center" })
      }
    },
  })

  // Check if we need a new page for SSL section
  const sslStartY = (doc as any).lastAutoTable.finalY + 20
  if (sslStartY > pageHeight - 100) {
    doc.addPage()
    const newSslStartY = margin
    addSSLSection(doc, data, newSslStartY, margin, contentWidth, primaryColor)
  } else {
    addSSLSection(doc, data, sslStartY, margin, contentWidth, primaryColor)
  }

  // Add recommendations section
  const recsStartY = (doc as any).lastAutoTable.finalY + 20
  if (recsStartY > pageHeight - 100) {
    doc.addPage()
    const newRecsStartY = margin
    addRecommendationsSection(doc, data, newRecsStartY, margin, contentWidth, primaryColor)
  } else {
    addRecommendationsSection(doc, data, recsStartY, margin, contentWidth, primaryColor)
  }

  // Add footer with logo and page numbers
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont("Montserrat", "normal")
    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    doc.text(`Cyber Audit Security Report - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    })

    // Add small logo in footer
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.circle(margin, pageHeight - 10, 3, "F")
  }

  return doc
}

// Helper function to add SSL section
function addSSLSection(
  doc: jsPDF,
  data: SecurityData,
  startY: number,
  margin: number,
  contentWidth: number,
  primaryColor: number[],
) {
  doc.setFont("Montserrat", "bold")
  doc.setFontSize(16)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text("SSL/TLS ANALYSIS", margin, startY)

  doc.setFont("Montserrat", "normal")
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(
    "SSL/TLS certificates secure the connection between your website and visitors. This analysis evaluates the strength and configuration of your SSL implementation.",
    margin,
    startY + 10,
    { maxWidth: contentWidth },
  )

  // SSL table
  const sslTableData = Object.entries(data.sslData.details).map(([check, present]) => [
    formatCheckName(check),
    present ? "Pass" : "Fail",
    getSslCheckDescription(check),
  ])

  doc.autoTable({
    startY: startY + 20,
    head: [["Check", "Status", "Description"]],
    body: sslTableData,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 11,
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: "bold" },
      1: { cellWidth: 40, halign: "center" },
      2: { cellWidth: contentWidth - 110 },
    },
    styles: {
      overflow: "linebreak",
      font: "Montserrat",
      fontSize: 10,
    },
    bodyStyles: {
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 255],
    },
    // Add custom styling for pass/fail status
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        const cell = data.cell
        const text = cell.text[0]
        const doc = data.doc
        const statusX = cell.x + cell.width / 2
        const statusY = cell.y + cell.height / 2 + 1

        if (text === "Pass") {
          doc.setFillColor(39, 174, 96) // Green
        } else {
          doc.setFillColor(231, 76, 60) // Red
        }

        doc.roundedRect(cell.x + 5, cell.y + 3, cell.width - 10, cell.height - 6, 2, 2, "F")
        doc.setTextColor(255, 255, 255)
        doc.text(text, statusX, statusY, { align: "center" })
      }
    },
  })
}

// Helper function to add recommendations section
function addRecommendationsSection(
  doc: jsPDF,
  data: SecurityData,
  startY: number,
  margin: number,
  contentWidth: number,
  primaryColor: number[],
) {
  doc.setFont("Montserrat", "bold")
  doc.setFontSize(16)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text("SECURITY RECOMMENDATIONS", margin, startY)

  // Recommendations table with priority
  const recsTableData = data.recommendations.map((rec) => [rec.title, rec.priority, rec.description])

  doc.autoTable({
    startY: startY + 10,
    head: [["Recommendation", "Priority", "Description"]],
    body: recsTableData,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 11,
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: "bold" },
      1: { cellWidth: 40, halign: "center" },
      2: { cellWidth: contentWidth - 120 },
    },
    styles: {
      overflow: "linebreak",
      font: "Montserrat",
      fontSize: 10,
    },
    bodyStyles: {
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 255],
    },
    // Add custom styling for priority levels
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        const cell = data.cell
        const text = cell.text[0]
        const doc = data.doc
        const statusX = cell.x + cell.width / 2
        const statusY = cell.y + cell.height / 2 + 1

        if (text === "High") {
          doc.setFillColor(231, 76, 60) // Red
        } else if (text === "Medium") {
          doc.setFillColor(243, 156, 18) // Orange
        } else {
          doc.setFillColor(52, 152, 219) // Blue
        }

        doc.roundedRect(cell.x + 5, cell.y + 3, cell.width - 10, cell.height - 6, 2, 2, "F")
        doc.setTextColor(255, 255, 255)
        doc.text(text, statusX, statusY, { align: "center" })
      }
    },
  })
}

// Helper function to draw a score box
function drawScoreBox(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  grade: string,
  score: number,
) {
  // Draw box with gradient background
  doc.setFillColor(...getGradeBackgroundColor(grade))
  doc.roundedRect(x, y, width, height, 5, 5, "F")

  // Add title
  doc.setFont("Montserrat", "bold")
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text(title, x + 10, y + 15)

  // Add grade
  doc.setFontSize(28)
  doc.text(grade, x + 20, y + 40)

  // Add score percentage
  doc.setFont("Montserrat", "normal")
  doc.setFontSize(12)
  doc.text(`${Math.round(score)}%`, x + width - 30, y + 40)

  // Add progress bar background
  doc.setFillColor(255, 255, 255, 0.3)
  doc.roundedRect(x + 60, y + 35, width - 90, 10, 5, 5, "F")

  // Add progress bar fill
  doc.setFillColor(255, 255, 255)
  const fillWidth = Math.min((score / 100) * (width - 90), width - 90)
  doc.roundedRect(x + 60, y + 35, fillWidth, 10, 5, 5, "F")
}

// Helper function to get grade background color
function getGradeBackgroundColor(grade: string): number[] {
  const colors: Record<string, number[]> = {
    "A+": [39, 174, 96], // Green
    A: [46, 204, 113], // Light green
    B: [52, 152, 219], // Blue
    C: [241, 196, 15], // Yellow
    D: [230, 126, 34], // Orange
    E: [231, 76, 60], // Red
    F: [192, 57, 43], // Dark red
  }

  return colors[grade] || [100, 100, 100]
}

// Helper functions
function formatHeaderName(header: string): string {
  return header
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-")
}

function formatCheckName(check: string): string {
  return check
    .replace(/([A-Z])/g, " $1")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function getHeaderDescription(header: string): string {
  const descriptions: Record<string, string> = {
    "strict-transport-security": "Forces browsers to use HTTPS for your site",
    "content-security-policy": "Controls which resources can be loaded",
    "x-content-type-options": "Prevents MIME type sniffing",
    "x-frame-options": "Controls if your site can be embedded in iframes",
    "x-xss-protection": "Helps prevent cross-site scripting attacks",
    "referrer-policy": "Controls what information is sent in the Referer header",
    "permissions-policy": "Controls which browser features can be used",
  }

  return descriptions[header.toLowerCase()] || "Security header for your website"
}

function getSslCheckDescription(check: string): string {
  const descriptions: Record<string, string> = {
    validCertificate: "Certificate is properly signed and not expired",
    strongCiphers: "Uses strong encryption algorithms",
    secureProtocols: "Uses TLS 1.2 or higher",
    certChainValid: "Certificate chain is properly configured",
  }

  return descriptions[check] || "SSL/TLS security check"
}

function getScoreDescription(score: string): string {
  const descriptions: Record<string, string> = {
    "A+": "Excellent! Your website has exceptional security configurations.",
    A: "Very good! Your website has strong security measures in place.",
    B: "Good. Your website has decent security, but there's room for improvement.",
    C: "Average. Your website has some security measures, but needs significant improvements.",
    D: "Below average. Your website has several security issues that should be addressed.",
    E: "Poor. Your website has major security vulnerabilities that need immediate attention.",
    F: "Critical. Your website has severe security issues that must be fixed as soon as possible.",
  }

  return descriptions[score] || "Your website's security needs to be evaluated."
}
