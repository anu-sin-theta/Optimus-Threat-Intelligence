"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, ExternalLink, AlertTriangle, Shield, FileText, Clock } from "lucide-react"

export default function ResultsTab() {
  const [searchFilter, setSearchFilter] = useState("")
  const [resultType, setResultType] = useState("all")

  // Mock search results data
  const results = [
    {
      id: 1,
      type: "cve",
      title: "CVE-2024-1234",
      description: "Remote Code Execution vulnerability in Apache Struts 2.x",
      severity: "critical",
      score: 9.8,
      published: "2024-01-10",
      affected: "Apache Struts 2.0.0 - 2.5.30",
      status: "Active",
    },
    {
      id: 2,
      type: "device",
      title: "web-server-01",
      description: "Production web server - Ubuntu 22.04 LTS",
      severity: "medium",
      score: 6.5,
      published: "2024-01-12",
      affected: "3 vulnerabilities detected",
      status: "Needs Patching",
    },
    {
      id: 3,
      type: "ioc",
      title: "203.0.113.45",
      description: "Malicious IP address associated with botnet activity",
      severity: "high",
      score: 8.2,
      published: "2024-01-14",
      affected: "Multiple connection attempts",
      status: "Blocked",
    },
    {
      id: 4,
      type: "cve",
      title: "CVE-2024-5678",
      description: "SQL Injection in WordPress Contact Form 7 plugin",
      severity: "high",
      score: 8.6,
      published: "2024-01-08",
      affected: "Contact Form 7 < 5.8.5",
      status: "Patch Available",
    },
    {
      id: 5,
      type: "threat",
      title: "Ransomware Campaign",
      description: "New ransomware variant targeting healthcare sector",
      severity: "critical",
      score: 9.5,
      published: "2024-01-15",
      affected: "Healthcare organizations",
      status: "Active Threat",
    },
    {
      id: 6,
      type: "device",
      title: "db-server-02",
      description: "Database server - PostgreSQL 14.5",
      severity: "low",
      score: 3.2,
      published: "2024-01-13",
      affected: "1 low-severity vulnerability",
      status: "Monitoring",
    },
  ]

  const getSeverityBadge = (severity) => {
    const variants = {
      critical: "destructive",
      high: "destructive",
      medium: "default",
      low: "secondary",
    }
    return (
      <Badge variant={variants[severity]} className="w-20 justify-center">
        {severity.toUpperCase()}
      </Badge>
    )
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "cve":
        return <AlertTriangle className="h-5 w-5 text-chart-1" />
      case "device":
        return <Shield className="h-5 w-5 text-chart-2" />
      case "ioc":
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case "threat":
        return <AlertTriangle className="h-5 w-5 text-chart-5" />
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />
    }
  }

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      searchFilter === "" ||
      result.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      result.description.toLowerCase().includes(searchFilter.toLowerCase())

    const matchesType = resultType === "all" || result.type === resultType

    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/20 to-accent/10 border-primary/50">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Search Results</CardTitle>
          <CardDescription>
            Aggregated results from CVE databases, device scans, IOC feeds, and threat intelligence
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Results</p>
                <p className="text-2xl font-bold text-foreground">{filteredResults.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">
                  {filteredResults.filter((r) => r.severity === "critical").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High</p>
                <p className="text-2xl font-bold text-chart-1">
                  {filteredResults.filter((r) => r.severity === "high").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-chart-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Devices</p>
                <p className="text-2xl font-bold text-chart-2">
                  {filteredResults.filter((r) => r.type === "device").length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-chart-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Filter results..."
                className="pl-10 bg-background"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>

            <Select value={resultType} onValueChange={setResultType}>
              <SelectTrigger className="w-full md:w-[180px] bg-background">
                <SelectValue placeholder="Result Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cve">CVE</SelectItem>
                <SelectItem value="device">Device</SelectItem>
                <SelectItem value="ioc">IOC</SelectItem>
                <SelectItem value="threat">Threat</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Results ({filteredResults.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className="flex flex-col md:flex-row gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getTypeIcon(result.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-mono font-semibold text-foreground">{result.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {result.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {result.published}
                      </span>
                      <span>Affected: {result.affected}</span>
                      <span>Status: {result.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end gap-3 md:w-32 shrink-0">
                  {getSeverityBadge(result.severity)}
                  <div className="text-center md:text-right">
                    <p className="text-xs text-muted-foreground">CVSS Score</p>
                    <p className="text-2xl font-bold text-primary">{result.score}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
