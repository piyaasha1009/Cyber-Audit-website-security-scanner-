import { jsPDF } from "jspdf"

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

export function generateSimplePDF(data: SecurityData): jsPDF {
  // Create a new PDF document
  const doc = new jsPDF()

  // Set font size and add title
  doc.setFontSize(22)
  doc.text("Security Audit Report", 105, 20, { align: "center" })

  // Add URL
  doc.setFontSize(14)
  doc.text(`Website: ${data.url}`, 105, 30, { align: "center" })

  // Add date
  doc.setFontSize(12)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: "center" })

  // Add overall grade
  doc.setFontSize(18)
  doc.text(`Overall Security Grade: ${data.overallGrade}`, 20, 60)

  // Add headers score
  doc.setFontSize(14)
  doc.text(`Security Headers Score: ${data.headersData.grade} (${Math.round(data.headersData.score)}%)`, 20, 80)

  // Add SSL score
  doc.text(`SSL/TLS Score: ${data.sslData.grade} (${Math.round(data.sslData.score)}%)`, 20, 90)

  // Add headers section
  doc.setFontSize(16)
  doc.text("Security Headers", 20, 110)

  // List headers
  doc.setFontSize(12)
  let y = 120
  Object.entries(data.headersData.headers).forEach(([header, present], index) => {
    const status = present ? "Present" : "Missing"
    doc.text(`${header}: ${status}`, 30, y + index * 10)
  })

  // Add SSL section
  y = y + Object.keys(data.headersData.headers).length * 10 + 20
  doc.setFontSize(16)
  doc.text("SSL/TLS Details", 20, y)

  // List SSL details
  doc.setFontSize(12)
  y += 10
  Object.entries(data.sslData.details).forEach(([check, passed], index) => {
    const status = passed ? "Pass" : "Fail"
    doc.text(`${check}: ${status}`, 30, y + index * 10)
  })

  // Add recommendations section
  y = y + Object.keys(data.sslData.details).length * 10 + 20
  doc.setFontSize(16)
  doc.text("Recommendations", 20, y)

  // List recommendations
  doc.setFontSize(12)
  y += 10
  data.recommendations.forEach((rec, index) => {
    doc.text(`${index + 1}. ${rec.title} (${rec.priority})`, 30, y + index * 20)
    doc.text(rec.description, 40, y + index * 20 + 10)
  })

  return doc
}
