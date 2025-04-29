import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, ExternalLink, Shield } from "lucide-react"
import Link from "next/link"
import ResultsContent from "./results-content"
import LoadingResults from "./loading-results"

export default function ResultsPage({
  searchParams,
}: {
  searchParams: { url?: string }
}) {
  const url = searchParams.url

  if (!url) {
    return notFound()
  }

  // Decode the URL
  const decodedUrl = decodeURIComponent(url)

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto mb-8">
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            Security Audit Results
          </h1>
          <p className="text-lg text-gray-700 mb-4 flex items-center justify-center">
            <span>{decodedUrl}</span>
            <a
              href={decodedUrl.startsWith("http") ? decodedUrl : `https://${decodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </p>
        </div>

        <Suspense fallback={<LoadingResults />}>
          <ResultsContent url={decodedUrl} />
        </Suspense>

        <div className="flex justify-center mt-8">
          <Link href={`/report?url=${encodeURIComponent(url)}`}>
            <Button
              variant="outline"
              className="mr-4 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all"
            >
              <Download className="mr-2 h-4 w-4" />
              View Full Report
            </Button>
          </Link>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md">
              Scan Another Website
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
