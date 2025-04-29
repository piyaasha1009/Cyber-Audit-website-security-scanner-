"use client"

import { useEffect, useState, useCallback } from "react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, ExternalLink, Printer, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"
import { fetchSecurityHeaders, fetchSslStatus } from "@/lib/api"
import type { SecurityData } from "@/lib/generate-pdf"

export default function ReportPage({
  searchParams,
}: {
  searchParams: { url?: string }
}) {
  const url = searchParams.url
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [reportData, setReportData] = useState<SecurityData | null>(null)

  if (!url) {
    return notFound()
  }

  // Decode the URL
  const decodedUrl = decodeURIComponent(url)

  const fetchData = useCallback(async () => {
    if (!decodedUrl) return
    try {
      const [headersData, sslData] = await Promise.all([fetchSecurityHeaders(decodedUrl), fetchSslStatus(decodedUrl)])

      // Calculate overall score
      const overallGrade = calculateOverallScore(headersData, sslData)

      // Generate recommendations
      const recommendations = generateRecommendations(headersData, sslData)

      // Set report data
      setReportData({
        url: decodedUrl,
        overallGrade,
        headersData,
        sslData,
        recommendations,
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
    }
  }, [decodedUrl])

  useEffect(() => {
    // Fetch data for the report
    fetchData()
  }, [fetchData])

  const downloadReport = async () => {
    if (!reportData) return

    setIsGenerating(true)

    try {
      // Dynamically import jsPDF and jspdf-autotable to ensure they're only loaded on the client
      const { jsPDF } = await import("jspdf")
      const autoTable = await import("jspdf-autotable")

      // Use the API endpoint to generate the PDF
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      // Get the PDF as a blob
      const pdfBlob = await response.blob()

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `cyber-audit-${decodedUrl.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setIsGenerated(true)
      setTimeout(() => setIsGenerated(false), 3000)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const printReport = () => {
    window.print()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 print:bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <Link
            href={`/results?url=${encodeURIComponent(url)}`}
            className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Link>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={printReport}
              className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={downloadReport}
              disabled={isGenerating || !reportData}
              className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-purple-700 border-t-transparent rounded-full"></div>
                  Generating...
                </>
              ) : isGenerated ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-white p-8 border rounded-lg shadow-lg print:shadow-none print:border-0">
          <div className="text-center mb-8">
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-md inline-block print:hidden">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text print:text-black">
              Security Audit Report
            </h1>
            <p className="text-lg text-slate-600 flex items-center justify-center">
              <span>{decodedUrl}</span>
              <a
                href={decodedUrl.startsWith("http") ? decodedUrl : `https://${decodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-slate-500 hover:text-slate-700 print:hidden"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </p>
            <p className="text-sm text-slate-500">
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>

          <ReportContent url={decodedUrl} />
        </div>
      </div>
    </main>
  )
}

function ReportContent({ url }: { url: string }) {
  const [headersData, setHeadersData] = useState<any>(null)
  const [sslData, setSslData] = useState<any>(null)
  const [overallScore, setOverallScore] = useState<string>("C")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch data for the report
    const fetchData = async () => {
      try {
        setLoading(true)
        const [headers, ssl] = await Promise.all([fetchSecurityHeaders(url), fetchSslStatus(url)])

        setHeadersData(headers)
        setSslData(ssl)

        // Calculate overall score
        const score = calculateOverallScore(headers, ssl)
        setOverallScore(score)
      } catch (error) {
        console.error("Error fetching report data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Executive Summary</h2>
        <p className="mb-4">
          This report provides a comprehensive security assessment of <strong>{url}</strong>. The assessment evaluates
          the website's security posture based on HTTP security headers and SSL/TLS implementation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <ScoreCard title="Overall Score" score={overallScore} description={getScoreDescription(overallScore)} />
          <ScoreCard
            title="Headers Score"
            score={headersData?.grade || "F"}
            description={getHeadersDescription(headersData)}
          />
          <ScoreCard title="SSL Score" score={sslData?.grade || "F"} description={getSSLDescription(sslData)} />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Security Headers Analysis</h2>
        <p className="mb-4">
          HTTP security headers are directives that your web server can send to the browser to improve security. They
          help mitigate common web vulnerabilities.
        </p>
        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="pt-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 text-purple-700">Header</th>
                  <th className="text-left pb-2 text-purple-700">Status</th>
                  <th className="text-left pb-2 text-purple-700">Description</th>
                </tr>
              </thead>
              <tbody>
                {headersData && headersData.headers ? (
                  Object.entries(headersData.headers).map(([header, present]: [string, any]) => (
                    <HeaderRow
                      key={header}
                      name={formatHeaderName(header)}
                      present={present}
                      description={getHeaderDescription(header)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">
                      No header data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-purple-700">SSL/TLS Analysis</h2>
        <p className="mb-4">
          SSL/TLS certificates secure the connection between your website and visitors. This analysis evaluates the
          strength and configuration of your SSL implementation.
        </p>
        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="pt-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 text-purple-700">Check</th>
                  <th className="text-left pb-2 text-purple-700">Status</th>
                  <th className="text-left pb-2 text-purple-700">Description</th>
                </tr>
              </thead>
              <tbody>
                {sslData && sslData.details ? (
                  <>
                    <HeaderRow
                      name="Valid Certificate"
                      present={sslData.details.validCertificate}
                      description="Certificate is properly signed and not expired"
                    />
                    <HeaderRow
                      name="Strong Ciphers"
                      present={sslData.details.strongCiphers}
                      description="Uses strong encryption algorithms"
                    />
                    <HeaderRow
                      name="Secure Protocols"
                      present={sslData.details.secureProtocols}
                      description="Uses TLS 1.2 or higher"
                    />
                    <HeaderRow
                      name="Valid Certificate Chain"
                      present={sslData.details.certChainValid}
                      description="Certificate chain is properly configured"
                    />
                  </>
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">
                      No SSL data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Recommendations</h2>
        <div className="space-y-4">
          {headersData && sslData ? (
            generateRecommendations(headersData, sslData).map((rec, index) => (
              <RecommendationItem key={index} title={rec.title} description={rec.description} priority={rec.priority} />
            ))
          ) : (
            <p className="text-center text-gray-500 p-4">Loading recommendations...</p>
          )}

          {headersData && sslData && generateRecommendations(headersData, sslData).length === 0 && (
            <p className="text-center text-green-600 p-4 bg-green-50 rounded-lg">
              Great job! Your website has good security configurations.
            </p>
          )}
        </div>
      </section>

      <section className="print:hidden">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Next Steps</h2>
        <p className="mb-4">Based on the findings in this report, we recommend the following next steps:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Address any "High" priority recommendations as soon as possible</li>
          <li>Create a plan to implement "Medium" priority recommendations</li>
          <li>Schedule regular security scans to monitor your progress</li>
          <li>Consider a more comprehensive security assessment for critical websites</li>
        </ul>
      </section>

      <div className="text-center text-sm text-gray-500 pt-8 border-t mt-12 print:hidden">
        <p>Generated by Cyber Audit Security Scanner</p>
        <p>© {new Date().getFullYear()} Cyber Audit. All rights reserved.</p>
      </div>
    </div>
  )
}

function ScoreCard({ title, score, description }: { title: string; score: string; description: string }) {
  const getScoreColor = (score: string) => {
    const colors: Record<string, string> = {
      "A+": "text-green-600",
      A: "text-green-600",
      B: "text-green-500",
      C: "text-yellow-500",
      D: "text-orange-500",
      E: "text-red-400",
      F: "text-red-600",
    }

    return colors[score] || "text-slate-600"
  }

  const getBgColor = (score: string) => {
    const colors: Record<string, string> = {
      "A+": "bg-green-100",
      A: "bg-green-100",
      B: "bg-green-50",
      C: "bg-yellow-50",
      D: "bg-orange-50",
      E: "bg-red-50",
      F: "bg-red-50",
    }

    return colors[score] || "bg-slate-50"
  }

  return (
    <Card className={`border-0 shadow-md ${getBgColor(score)}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</div>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

function HeaderRow({
  name,
  present,
  description,
}: {
  name: string
  present: boolean
  description: string
}) {
  return (
    <tr className="border-b">
      <td className="py-3 font-medium">{name}</td>
      <td className="py-3">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            present ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {present ? "Present" : "Missing"}
        </span>
      </td>
      <td className="py-3 text-slate-600">{description}</td>
    </tr>
  )
}

function RecommendationItem({
  title,
  description,
  priority,
}: {
  title: string
  description: string
  priority: string
}) {
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      High: "bg-red-100 text-red-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-blue-100 text-blue-800",
    }

    return colors[priority] || "bg-slate-100 text-slate-800"
  }

  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-purple-700">{title}</h3>
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(priority)}`}>
          {priority} Priority
        </span>
      </div>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}

// Helper functions
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

function getHeadersDescription(data: any): string {
  if (!data || !data.headers) return "No header data available"

  const presentCount = Object.values(data.headers).filter(Boolean).length
  const totalCount = Object.keys(data.headers).length

  if (presentCount === totalCount) return "All security headers are properly configured"
  if (presentCount === 0) return "No security headers are configured"

  return `${presentCount} of ${totalCount} security headers are configured`
}

function getSSLDescription(data: any): string {
  if (!data || !data.details) return "No SSL data available"

  const passedCount = Object.values(data.details).filter(Boolean).length
  const totalCount = Object.keys(data.details).length

  if (passedCount === totalCount) return "SSL is properly configured"
  if (passedCount === 0) return "SSL has critical issues"

  return `${passedCount} of ${totalCount} SSL checks passed`
}

function gradeToScore(grade: string): number {
  const scores: Record<string, number> = {
    "A+": 100,
    A: 95,
    B: 85,
    C: 75,
    D: 65,
    E: 55,
    F: 45,
  }

  return scores[grade] || 0
}

function generateRecommendations(
  headersData: any,
  sslData: any,
): Array<{ title: string; description: string; priority: string }> {
  const recommendations = []

  // Check headers
  if (headersData && headersData.headers) {
    if (!headersData.headers["strict-transport-security"]) {
      recommendations.push({
        title: "Add Strict-Transport-Security Header",
        description:
          "This header ensures users always connect to your site over HTTPS, protecting against downgrade attacks.",
        priority: "High",
      })
    }

    if (!headersData.headers["content-security-policy"]) {
      recommendations.push({
        title: "Implement Content Security Policy",
        description: "CSP helps prevent XSS attacks by controlling which resources can be loaded on your site.",
        priority: "Medium",
      })
    }

    if (!headersData.headers["x-content-type-options"]) {
      recommendations.push({
        title: "Add X-Content-Type-Options Header",
        description:
          "This header prevents browsers from interpreting files as a different MIME type, reducing the risk of attacks.",
        priority: "Medium",
      })
    }
  }

  // Check SSL
  if (sslData && sslData.details) {
    if (!sslData.details.secureProtocols) {
      recommendations.push({
        title: "Upgrade TLS Protocol Version",
        description: "Use TLS 1.2 or higher and disable older, insecure protocols like SSL 3.0 and TLS 1.0.",
        priority: "High",
      })
    }

    if (!sslData.details.strongCiphers) {
      recommendations.push({
        title: "Strengthen SSL Cipher Suites",
        description: "Configure your server to use strong, modern cipher suites and disable weak ones.",
        priority: "Medium",
      })
    }
  }

  return recommendations
}

function formatHeaderName(header: string): string {
  return header
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-")
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

function calculateOverallScore(headersData: any, sslData: any): string {
  // Simple algorithm to calculate overall score
  const headerGrade = headersData?.grade || "F"
  const sslGrade = sslData?.grade || "F"

  const headerScore = gradeToScore(headerGrade)
  const sslScore = gradeToScore(sslGrade)

  // SSL is weighted slightly more
  const overallScore = Math.round(headerScore * 0.4 + sslScore * 0.6)

  if (overallScore >= 95) return "A+"
  if (overallScore >= 85) return "A"
  if (overallScore >= 75) return "B"
  if (overallScore >= 65) return "C"
  if (overallScore >= 55) return "D"
  if (overallScore >= 45) return "E"
  return "F"
}
