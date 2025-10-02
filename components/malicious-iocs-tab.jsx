"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Globe, FileCode, Link, Search, Filter, Download } from "lucide-react"

export default function MaliciousIocsTab() {
  const [maliciousIPs, setMaliciousIPs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState("")

  useEffect(() => {
    const fetchMaliciousIPs = async () => {
      try {
        const response = await fetch("/api/threatfox")
        const data = await response.json()
        setMaliciousIPs(data.data || [])
      } catch (error) {
        console.error("Error fetching malicious IPs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMaliciousIPs()
  }, [])

  const handleIPSearch = async () => {
    if (!searchInput) return

    try {
      setLoading(true)
      const response = await fetch(`/api/abuseipdb?ip=${searchInput}`)
      const data = await response.json()

      if (data) {
        setMaliciousIPs((prev) => [data, ...prev])
      }
    } catch (error) {
      console.error("Error searching IP:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search IP address..."
                className="pl-9 bg-background"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleIPSearch()}
              />
            </div>
            <Button variant="outline" className="gap-2 bg-transparent" onClick={handleIPSearch}>
              Search
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Malicious IPs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{maliciousIPs.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">High Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-5">
              {maliciousIPs.filter((ip) => ip.confidence_score >= 90).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active Threats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-4">
              {maliciousIPs.filter(
                (ip) => ip.last_seen_at > new Date(Date.now() - 86400000).toISOString()
              ).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Malicious IPs List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Malicious IP Addresses</CardTitle>
          <CardDescription>Known malicious IPs from multiple threat intelligence sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div>Loading...</div>
            ) : (
              maliciousIPs.map((ip, index) => (
                <div
                  key={`${ip.ip}-${index}`}
                  className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={ip.confidence_score >= 90 ? "destructive" : "default"}>
                          {ip.confidence_score >= 90 ? "High Confidence" : "Medium Confidence"}
                        </Badge>
                        <span className="font-mono font-bold text-foreground">
                          {ip.ip || ip.ioc}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>
                          Type:{" "}
                          <span className="text-foreground">{ip.abuse_type || ip.malware_type}</span>
                        </span>
                        <span>
                          Country:{" "}
                          <span className="text-foreground">{ip.country_code}</span>
                        </span>
                        <span>
                          Last Seen:{" "}
                          <span className="text-foreground">{ip.last_seen_at}</span>
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
