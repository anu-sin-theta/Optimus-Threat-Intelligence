"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThreatLineChart } from "@/components/charts/threat-line-chart"
import { VulnerabilityBarChart } from "@/components/charts/vulnerability-bar-chart"
import { AlertTriangle, Shield, Activity, Database, Globe } from "lucide-react"
import AnimatedSearchModal from "@/components/animated-search-modal"

export default function DashboardTab() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent threats data
        const [nvdResponse, cisaResponse] = await Promise.all([
          fetch("/api/nvd?days=7"),
          fetch("/api/cisa?days=7"),
        ])

        const [nvdData, cisaData] = await Promise.all([
          nvdResponse.json(),
          cisaResponse.json(),
        ])

        // Process and combine the data
        setDashboardData({
          recentCVEs: nvdData.vulnerabilities || [],
          recentKEV: cisaData.vulnerabilities || [],
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const calculateStats = () => {
    if (!dashboardData) return {}

    const criticalCVEs = dashboardData.recentCVEs.filter(
      (cve) => cve.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity === "CRITICAL"
    ).length

    const kevCount = dashboardData.recentKEV.length

    return {
      criticalCVEs,
      kevCount,
      totalCVEs: dashboardData.recentCVEs.length,
    }
  }

  const stats = calculateStats()

  return (
    <div className="space-y-6">
      <div className="flex gap-4 w-full h-[200px]">
        <Card className="flex-[0.8] bg-gradient-to-r from-primary/20 to-accent/10 border-primary/50">
          <CardContent className="flex items-center justify-between h-full p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary animate-pulse" />
                <h2 className="text-2xl font-bold text-foreground">Live Threat Monitor</h2>
              </div>
              <p className="text-muted-foreground">Real-time threat intelligence aggregation</p>
              <div className="flex gap-4 mt-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Active Threats</p>
                  <p className="text-3xl font-bold text-primary">1,247</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Critical CVEs</p>
                  <p className="text-3xl font-bold text-destructive">89</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">IOCs Detected</p>
                  <p className="text-3xl font-bold text-chart-2">3,456</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              <div className="text-center">
                <Shield className="h-16 w-16 text-primary mx-auto mb-2" />
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary">
                  System Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="flex-[0.2] bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
          onClick={() => setIsSearchModalOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-6 gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-1">Quick Search</h3>
              <p className="text-xs text-muted-foreground">Click to search</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AnimatedSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card hover:bg-card/80 transition-colors border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total CVEs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-foreground">24,891</p>
              <AlertTriangle className="h-8 w-8 text-chart-1" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">+234 this week</p>
          </CardContent>
        </Card>

        <Card className="bg-card hover:bg-card/80 transition-colors border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">KEV Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-foreground">1,089</p>
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">+12 exploited</p>
          </CardContent>
        </Card>

        <Card className="bg-card hover:bg-card/80 transition-colors border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Malicious IPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-foreground">8,432</p>
              <Globe className="h-8 w-8 text-chart-5" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">+567 blocked</p>
          </CardContent>
        </Card>

        <Card className="bg-card hover:bg-card/80 transition-colors border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-foreground">12</p>
              <Database className="h-8 w-8 text-chart-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">All active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="text-foreground">Threat Trends (30 Days)</CardTitle>
            <CardDescription>CVE discoveries and exploit activity over time</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <ThreatLineChart />
          </CardContent>
        </Card>

        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground">Severity Distribution</CardTitle>
            <CardDescription>Current week breakdown</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <VulnerabilityBarChart />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Critical Alerts</CardTitle>
          <CardDescription>High-priority threats requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "CVE-2024-1234",
                severity: "CRITICAL",
                score: 9.8,
                title: "Remote Code Execution in Apache Struts",
                time: "2 hours ago",
              },
              {
                id: "CVE-2024-5678",
                severity: "HIGH",
                score: 8.6,
                title: "SQL Injection in WordPress Plugin",
                time: "5 hours ago",
              },
              {
                id: "CVE-2024-9012",
                severity: "CRITICAL",
                score: 9.9,
                title: "Zero-Day in Microsoft Exchange",
                time: "8 hours ago",
              },
              {
                id: "CVE-2024-3456",
                severity: "HIGH",
                score: 8.2,
                title: "Authentication Bypass in Cisco IOS",
                time: "12 hours ago",
              },
            ].map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border"
              >
                <div className="flex items-center gap-4">
                  <Badge
                    variant={alert.severity === "CRITICAL" ? "destructive" : "default"}
                    className="w-20 justify-center"
                  >
                    {alert.severity}
                  </Badge>
                  <div>
                    <p className="font-mono font-semibold text-foreground">{alert.id}</p>
                    <p className="text-sm text-muted-foreground">{alert.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{alert.score}</p>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Section: Unified Threat Intelligence Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Unified Threat Intelligence</CardTitle>
            <CardDescription>Aggregated threat data from multiple sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div>Loading threat intelligence data...</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Critical CVEs (7d)</p>
                      <p className="text-3xl font-bold text-destructive">{stats.criticalCVEs}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">New KEV Entries</p>
                      <p className="text-3xl font-bold text-chart-5">{stats.kevCount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total CVEs (7d)</p>
                      <p className="text-3xl font-bold text-chart-4">{stats.totalCVEs}</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    View Detailed Report
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
