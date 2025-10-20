"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function CNAEnricherTab() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const handleEnrichment = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch("/api/cna-enricher")
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error starting enrichment:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CNA Data Enrichment</CardTitle>
          <CardDescription>Enrich local NVD and KEV data with the latest CVE information from CNAs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleEnrichment} disabled={loading}>
            {loading ? "Enriching..." : "Start Enrichment"}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Enrichment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-md">{JSON.stringify(results, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
