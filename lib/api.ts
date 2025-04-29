// Mock API functions for security headers and SSL status
// In a real implementation, these would call actual APIs

export async function fetchSecurityHeaders(url: string) {
  // This would call the SecurityHeaders API in a real implementation
  // For now, we'll return mock data

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Extract domain from URL
  const domain = extractDomain(url)

  // Generate somewhat random but consistent results based on the domain
  const domainSum = domain.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)

  // Determine which headers are present based on the domain
  const headers = {
    "strict-transport-security": domainSum % 5 !== 0,
    "content-security-policy": domainSum % 4 !== 0,
    "x-content-type-options": domainSum % 3 !== 0,
    "x-frame-options": domainSum % 2 !== 0,
    "referrer-policy": domainSum % 7 !== 0,
    "permissions-policy": domainSum % 8 !== 0,
  }

  // Count how many headers are present
  const presentCount = Object.values(headers).filter(Boolean).length
  const totalCount = Object.keys(headers).length
  const percentage = (presentCount / totalCount) * 100

  // Determine grade based on percentage
  let grade
  if (percentage === 100) grade = "A+"
  else if (percentage >= 83) grade = "A"
  else if (percentage >= 67) grade = "B"
  else if (percentage >= 50) grade = "C"
  else if (percentage >= 33) grade = "D"
  else if (percentage >= 17) grade = "E"
  else grade = "F"

  return {
    grade,
    headers,
    score: percentage,
  }
}

export async function fetchSslStatus(url: string) {
  // This would call the SSL Labs API in a real implementation
  // For now, we'll return mock data

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Extract domain from URL
  const domain = extractDomain(url)

  // Generate somewhat random but consistent results based on the domain
  const domainSum = domain.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)

  // Determine SSL details based on the domain
  const details = {
    validCertificate: domainSum % 5 !== 0,
    strongCiphers: domainSum % 4 !== 0,
    secureProtocols: domainSum % 3 !== 0,
    certChainValid: domainSum % 2 !== 0,
  }

  // Count how many checks passed
  const passedCount = Object.values(details).filter(Boolean).length
  const totalCount = Object.keys(details).length
  const percentage = (passedCount / totalCount) * 100

  // Determine grade based on percentage
  let grade
  if (percentage === 100) grade = "A+"
  else if (percentage >= 75) grade = "A"
  else if (percentage >= 50) grade = "B"
  else if (percentage >= 25) grade = "C"
  else grade = "F"

  return {
    grade,
    details,
    score: percentage,
  }
}

// Helper function to extract domain from URL
function extractDomain(url: string): string {
  try {
    // Add protocol if missing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url
    }

    const urlObj = new URL(url)
    return urlObj.hostname
  } catch (error) {
    // If URL parsing fails, return the original string
    return url
  }
}
