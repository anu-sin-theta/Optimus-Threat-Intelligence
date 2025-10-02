"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, RefreshCw, AlertCircle, CheckCircle, XCircle } from "lucide-react"

export default function LogsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [logType, setLogType] = useState("all")
  const [severity, setSeverity] = useState("all")

  // Mock log data
  const logs = [
    {
      id: 1,
      timestamp: "2024-01-15 14:32:18",
      type: "firewall",
      severity: "high",
      source: "192.168.1.100",
      destination: "10.0.0.50",
      action: "blocked",
      message: "Suspicious outbound connection attempt to known malicious IP",
    },
    {
      id: 2,
      timestamp: "2024-01-15 14:31:45",
      type: "host",
      severity: "medium",
      source: "web-server-01",
      destination: "N/A",
      action: "alert",
      message: "Multiple failed SSH login attempts detected",
    },
    {
      id: 3,
      timestamp: "2024-01-15 14:30:22",
      type: "firewall",
      severity: "critical",
      source: "203.0.113.45",
      destination: "192.168.1.10",
      action: "blocked",
      message: "DDoS attack pattern detected from external source",
    },
    {
      id: 4,
      timestamp: "2024-01-15 14:29:10",
      type: "host",
      severity: "low",
      source: "db-server-02",
      destination: "N/A",
      action: "info",
      message: "Routine security scan completed successfully",
    },
    {
      id: 5,
      timestamp: "2024-01-15 14:28:33",
      type: "firewall",
      severity: "high",
      source: "198.51.100.78",
      destination: "192.168.1.25",
      action: "blocked",
      message: "Port scanning activity detected",
    },
    {
      id: 6,
      timestamp: "2024-01-15 14:27:55",
      type: "host",
      severity: "medium",
      source: "app-server-03",
      destination: "N/A",
      action: "alert",
      message: "Unusual process execution detected",
    },
    {
      id: 7,
      timestamp: "2024-01-15 14:26:12",
      type: "firewall",
      severity: "low",
      source: "192.168.1.50",
      destination: "8.8.8.8",
      action: "allowed",
      message: "Normal DNS query to trusted resolver",
    },
    {
      id: 8,
      timestamp: "2024-01-15 14:25:40",
      type: "host",
      severity: "critical",
      source: "mail-server-01",
      destination: "N/A",
      action: "blocked",
      message: "Malware signature detected in email attachment",
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

  const getActionIcon = (action) => {
    switch (action) {
      case "blocked":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "allowed":
        return <CheckCircle className="h-5 w-5 text-chart-2" />
      case "alert":
        return <AlertCircle className="h-5 w-5 text-chart-1" />
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.destination.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = logType === "all" || log.type === logType
    const matchesSeverity = severity === "all" || log.severity === severity

    return matchesSearch && matchesType && matchesSeverity
  })

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/20 to-accent/10 border-primary/50">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Security Logs</CardTitle>
          <CardDescription>Firewall and host-based security event logs</CardDescription>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search logs by message, source, or destination..."
                className="pl-10 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Log Type Filter */}
            <Select value={logType} onValueChange={setLogType}>
              <SelectTrigger className="w-full md:w-[180px] bg-background">
                <SelectValue placeholder="Log Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="firewall">Firewall</SelectItem>
                <SelectItem value="host">Host</SelectItem>
              </SelectContent>
            </Select>

            {/* Severity Filter */}
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="w-full md:w-[180px] bg-background">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Log Entries</CardTitle>
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary">
              {filteredLogs.length} entries
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border"
              >
                <div className="flex items-center gap-3 md:w-48 shrink-0">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Timestamp</span>
                    <span className="font-mono text-sm text-foreground">{log.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:w-32 shrink-0">{getSeverityBadge(log.severity)}</div>

                <div className="flex items-center gap-3 md:w-24 shrink-0">
                  <Badge variant="outline" className="w-20 justify-center">
                    {log.type}
                  </Badge>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground mb-1">{log.message}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>Source: {log.source}</span>
                    {log.destination !== "N/A" && <span>→ Dest: {log.destination}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 md:w-24 shrink-0">
                  {getActionIcon(log.action)}
                  <span className="text-sm font-medium text-foreground capitalize">{log.action}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
