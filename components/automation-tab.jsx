"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Clock, Play, Pause, Settings } from "lucide-react"

export default function AutomationTab() {
  const jobs = [
    {
      name: "Daily CVE Update",
      schedule: "Every day at 00:00 UTC",
      status: "Active",
      lastRun: "2024-01-15 00:00",
      nextRun: "2024-01-16 00:00",
    },
    {
      name: "Hourly IOC Ingestion",
      schedule: "Every hour",
      status: "Active",
      lastRun: "2024-01-15 14:00",
      nextRun: "2024-01-15 15:00",
    },
    {
      name: "KEV Catalog Refresh",
      schedule: "Every 4 hours",
      status: "Active",
      lastRun: "2024-01-15 12:00",
      nextRun: "2024-01-15 16:00",
    },
    {
      name: "News Feed Collection",
      schedule: "Every 6 hours",
      status: "Paused",
      lastRun: "2024-01-15 06:00",
      nextRun: "N/A",
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Automated Data Collection Jobs</CardTitle>
          <CardDescription>Scheduled tasks for continuous threat intelligence gathering</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <div key={index} className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge
                        variant={job.status === "Active" ? "default" : "secondary"}
                        className={job.status === "Active" ? "bg-chart-2" : ""}
                      >
                        {job.status}
                      </Badge>
                      <h3 className="font-semibold text-foreground">{job.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.schedule}
                      </span>
                      <span>
                        Last Run: <span className="text-foreground">{job.lastRun}</span>
                      </span>
                      <span>
                        Next Run: <span className="text-foreground">{job.nextRun}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={job.status === "Active"} />
                    <Button variant="outline" size="icon">
                      {job.status === "Active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-2">3</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">1,247</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">99.8%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Data Source Configuration</CardTitle>
          <CardDescription>Manage API endpoints and credentials for threat intelligence sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["NVD", "CISA KEV", "Red Hat", "MITRE ATT&CK", "Vulners", "AbuseIPDB", "ThreatFox", "NewsAPI"].map(
              (source) => (
                <div
                  key={source}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
                >
                  <span className="font-medium text-foreground">{source}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-chart-2/20 text-chart-2 border-chart-2">
                      Connected
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
