import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Shield } from "lucide-react"
import { scanWebsite } from "@/app/actions"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
          <div className="mb-6 p-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-lg">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            Cyber Audit
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            A simple security scanner for your website. No technical expertise required.
          </p>

          <Card className="w-full mb-8 border-0 shadow-xl bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-purple-700">Scan Your Website</CardTitle>
              <CardDescription>Enter your website URL to check for common security vulnerabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={scanWebsite} className="flex flex-col md:flex-row gap-3">
                <Input
                  name="url"
                  type="url"
                  placeholder="https://example.com"
                  className="flex-1 border-purple-200 focus-visible:ring-purple-500"
                  required
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md"
                >
                  Scan Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <FeatureCard
              title="Security Headers"
              description="Check if your website has proper HTTP security headers configured."
            />
            <FeatureCard
              title="SSL Certificate"
              description="Verify your SSL certificate status and HTTPS implementation."
            />
            <FeatureCard
              title="Simple Reports"
              description="Get an easy-to-understand A-F grade and downloadable report."
            />
          </div>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="text-lg text-purple-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}
