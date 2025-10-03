"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, RotateCw } from "lucide-react"

export default function MaliciousIocsTab() {
  const [ipAddress, setIpAddress] = useState("")
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const checkIp = async () => {
    if (!ipAddress) {
      setError("Please enter an IP address.")
      setResults(null)
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch(`/api/abuseipdb?ip=${ipAddress}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "An unknown error occurred.")
        return
      }

      setResults(data.data)
    } catch (err) {
      console.error("Error checking IP:", err)
      setError("Failed to connect to the API.")
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (score) => {
    if (score >= 90) return "bg-red-500"
    if (score >= 70) return "bg-orange-500"
    if (score >= 50) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="flex justify-center">
        <Card className="bg-card border-border w-full max-w-3xl">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                  loading ? 'animate-spin text-primary' : 'text-muted-foreground'
                }`} />
                <Input
                  type="text"
                  placeholder="Enter IP address (e.g., 1.1.1.1 or 2001:db8::1)"
                  className="pl-9 bg-background"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') checkIp(); }}
                />
              </div>
              <Button onClick={checkIp} disabled={loading}>
                {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : "Check IP"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="text-center text-red-500 p-4">
          Error: {error}
        </div>
      )}

      {results ? (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">IP Address: {results.ipAddress}</CardTitle>
              <CardDescription>Abuse Confidence Score: {results.abuseConfidenceScore}%</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={results.abuseConfidenceScore} className="w-full" indicatorColor={getConfidenceColor(results.abuseConfidenceScore)} />
              
              <Tabs defaultValue="details" className="w-full mt-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  {results.reports && results.reports.length > 0 && <TabsTrigger value="reports">Reports ({results.reports.length})</TabsTrigger>}
                  <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Is Public</TableCell>
                        <TableCell>{results.isPublic ? "Yes" : "No"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">IP Version</TableCell>
                        <TableCell>{results.ipVersion}</TableCell>
                      </TableRow>
                      {results.countryName && (
                        <TableRow>
                          <TableCell className="font-medium">Country</TableCell>
                          <TableCell>{results.countryName} ({results.countryCode})</TableCell>
                        </TableRow>
                      )}
                      {results.usageType && (
                        <TableRow>
                          <TableCell className="font-medium">Usage Type</TableCell>
                          <TableCell>{results.usageType}</TableCell>
                        </TableRow>
                      )}
                      {results.isp && (
                        <TableRow>
                          <TableCell className="font-medium">ISP</TableCell>
                          <TableCell>{results.isp}</TableCell>
                        </TableRow>
                      )}
                      {results.domain && (
                        <TableRow>
                          <TableCell className="font-medium">Domain</TableCell>
                          <TableCell>{results.domain}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell className="font-medium">Total Reports</TableCell>
                        <TableCell>{results.totalReports}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Last Reported</TableCell>
                        <TableCell>{results.lastReportedAt ? new Date(results.lastReportedAt).toLocaleString() : "N/A"}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TabsContent>

                {results.reports && results.reports.length > 0 && (
                  <TabsContent value="reports" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reported At</TableHead>
                          <TableHead>Comment</TableHead>
                          <TableHead>Categories</TableHead>
                          <TableHead>Reporter Country</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.reports.map((report, index) => (
                          <TableRow key={index}>
                            <TableCell>{new Date(report.reportedAt).toLocaleString()}</TableCell>
                            <TableCell className="max-w-xs truncate">{report.comment}</TableCell>
                            <TableCell>{report.categories.join(', ')}</TableCell>
                            <TableCell>{report.reporterCountryName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                )}

                <TabsContent value="raw" className="mt-4">
                  <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-md">{JSON.stringify(results, null, 2)}</pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-2 text-foreground">Check Malicious IP Addresses</h2>
          <p className="mb-4">Enter an IP address (IPv4 or IPv6) to check its abuse confidence score and detailed reports from AbuseIPDB.</p>
          <ul className="text-left max-w-md mx-auto list-disc list-inside space-y-1">
            <li>Enter an IP address in the search bar above.</li>
            <li>Click "Check IP" or press Enter.</li>
            <li>View details like abuse confidence score, country, ISP, and reported incidents.</li>
          </ul>
        </div>
      )}
    </div>
  )
}