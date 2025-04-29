"use server"

import { redirect } from "next/navigation"

export async function scanWebsite(formData: FormData) {
  const url = formData.get("url") as string

  if (!url) {
    throw new Error("URL is required")
  }

  // Validate URL format
  try {
    new URL(url)
  } catch (error) {
    throw new Error("Invalid URL format")
  }

  // Encode the URL for the redirect
  const encodedUrl = encodeURIComponent(url)

  // Redirect to the results page with the URL as a query parameter
  redirect(`/results?url=${encodedUrl}`)
}
