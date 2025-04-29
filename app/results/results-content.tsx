import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import { fetchSecurityHeaders, fetchSslStatus } from "@/lib/api"

export default async function ResultsContent({ url }: { url: string }) {
  // Fetch security data from APIs
  const [headersData, sslData] = await Promise.all([fetchSecurityHeaders(url), fetchSslStatus(url)])

  // Calculate overall score (A-F)
  const overallScore = calculateOverallScore(headersData, sslData)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SecurityHeadersCard data={headersData} />
        <SslCertificateCard data={sslData} />
      </div>

      <OverallScoreCard score={overallScore} />

      <SecurityRecommendations headersData={headersData} sslData={sslData} />
    </div>
  )
}

function SecurityHeadersCard({ data }: { data: any }) {
  const grade = data.grade || "F"
  const score = gradeToScore(grade)

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur overflow-hidden">
      <div className={`h-2 w-full ${getGradeColorClass(grade)}`}></div>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Security Headers</span>
          <Badge className={`text-lg px-3 py-1 ${getGradeColorClass(grade)}`}>{grade}</Badge>
        </CardTitle>
        <CardDescription>HTTP security header configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={score} className={`h-2 mb-4 ${getGradeProgressColorClass(grade)}`} />

        <div className="space-y-3">
          {data.headers ? (
            Object.entries(data.headers).map(([header, present]: [string, any]) => (
              <div key={header} className="flex items-start">
                {present ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{formatHeaderName(header)}</p>
                  <p className="text-sm text-slate-600">{getHeaderDescription(header)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-500">
              <p>No header data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SslCertificateCard({ data }: { data: any }) {
  const grade = data.grade || "F"
  const score = gradeToScore(grade)

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur overflow-hidden">
      <div className={`h-2 w-full ${getGradeColorClass(grade)}`}></div>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>SSL Certificate</span>
          <Badge className={`text-lg px-3 py-1 ${getGradeColorClass(grade)}`}>{grade}</Badge>
        </CardTitle>
        <CardDescription>HTTPS and SSL certificate status</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={score} className={`h-2 mb-4 ${getGradeProgressColorClass(grade)}`} />

        <div className="space-y-3">
          {data.details ? (
            <>
              <StatusItem
                status={data.details.validCertificate}
                title="Valid Certificate"
                description="Certificate is properly signed and not expired"
              />
              <StatusItem
                status={data.details.strongCiphers}
                title="Strong Ciphers"
                description="Uses strong encryption algorithms"
              />
              <StatusItem
                status={data.details.secureProtocols}
                title="Secure Protocols"
                description="Uses TLS 1.2 or higher"
              />
              <StatusItem
                status={data.details.certChainValid}
                title="Valid Certificate Chain"
                description="Certificate chain is properly configured"
              />
            </>
          ) : (
            <div className="text-center text-slate-500">
              <p>No SSL data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function StatusItem({
  status,
  title,
  description,
}: {
  status: boolean
  title: string
  description: string
}) {
  return (
    <div className="flex items-start">
      {status ? (
        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
      )}
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  )
}

function OverallScoreCard({ score }: { score: string }) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur overflow-hidden">
      <div className={`h-2 w-full ${getGradeColorClass(score)}`}></div>
      <CardHeader>
        <CardTitle className="text-center">Overall Security Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className={`text-6xl font-bold mb-4 ${getGradeTextColorClass(score)}`}>{score}</div>
        <p className="text-slate-600 text-center max-w-md">{getScoreDescription(score)}</p>
      </CardContent>
    </Card>
  )
}

function SecurityRecommendations({
  headersData,
  sslData,
}: {
  headersData: any
  sslData: any
}) {
  // Generate recommendations based on scan results
  const recommendations = generateRecommendations(headersData, sslData)

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur overflow-hidden">
      <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
      <CardHeader>
        <CardTitle>Security Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${getPriorityColorClass(rec.priority)}`}>
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium flex items-center">
                    {rec.title}
                    <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${getPriorityBadgeClass(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-green-600 p-4 bg-green-50 rounded-lg">
              Great job! Your website has good security configurations.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions
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

function getGradeColorClass(grade: string): string {
  const colors: Record<string, string> = {
    "A+": "bg-gradient-to-r from-green-400 to-green-500",
    A: "bg-gradient-to-r from-green-400 to-green-500",
    B: "bg-gradient-to-r from-teal-400 to-green-400",
    C: "bg-gradient-to-r from-yellow-400 to-amber-500",
    D: "bg-gradient-to-r from-orange-400 to-amber-500",
    E: "bg-gradient-to-r from-red-400 to-orange-500",
    F: "bg-gradient-to-r from-red-500 to-pink-500",
  }

  return colors[grade] || "bg-gradient-to-r from-gray-400 to-gray-500"
}

function getGradeTextColorClass(grade: string): string {
  const colors: Record<string, string> = {
    "A+": "text-green-500",
    A: "text-green-500",
    B: "text-teal-500",
    C: "text-amber-500",
    D: "text-orange-500",
    E: "text-red-500",
    F: "text-red-600",
  }

  return colors[grade] || "text-gray-500"
}

function getGradeProgressColorClass(grade: string): string {
  const colors: Record<string, string> = {
    "A+": "bg-green-500",
    A: "bg-green-500",
    B: "bg-teal-500",
    C: "bg-amber-500",
    D: "bg-orange-500",
    E: "bg-red-500",
    F: "bg-red-600",
  }

  return colors[grade] || "bg-gray-500"
}

function getPriorityColorClass(priority: string): string {
  const colors: Record<string, string> = {
    High: "bg-red-500",
    Medium: "bg-amber-500",
    Low: "bg-blue-500",
  }

  return colors[priority] || "bg-gray-500"
}

function getPriorityBadgeClass(priority: string): string {
  const colors: Record<string, string> = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-blue-100 text-blue-800",
  }

  return colors[priority] || "bg-gray-100 text-gray-800"
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

function calculateOverallScore(headersData: any, sslData: any): string {
  // Simple algorithm to calculate overall score
  const headerGrade = headersData.grade || "F"
  const sslGrade = sslData.grade || "F"

  const headerScore = gradeToScore(headerGrade)
  const sslScore = gradeToScore(sslGrade)

  // SSL is weighted slightly more than headers
  const overallScore = headerScore * 0.45 + sslScore * 0.55

  if (overallScore >= 95) return "A+"
  if (overallScore >= 90) return "A"
  if (overallScore >= 80) return "B"
  if (overallScore >= 70) return "C"
  if (overallScore >= 60) return "D"
  if (overallScore >= 50) return "E"
  return "F"
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

function generateRecommendations(
  headersData: any,
  sslData: any,
): Array<{ title: string; description: string; priority: string }> {
  const recommendations = []

  // Check headers
  if (headersData.headers) {
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
  if (sslData.details) {
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
