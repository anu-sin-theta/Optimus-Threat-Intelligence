"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThreatLineChart } from "@/components/charts/threat-line-chart"
import { VulnerabilityBarChart } from "@/components/charts/vulnerability-bar-chart"
import { AlertTriangle, Shield, Activity, Database, Globe, Target, AlertCircle } from "lucide-react"
import Image from "next/image"
import AnimatedSearchModal from "@/components/animated-search-modal"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DashboardTab() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [nvdData, setNvdData] = useState({ vulnerabilities: [], stats: {} })
  const [cisaData, setCisaData] = useState({ vulnerabilities: [], stats: {} })
  const [maliciousIPs, setMaliciousIPs] = useState([])
  const [mitreData, setMitreData] = useState({ techniques: [] })
  const [threatStats, setThreatStats] = useState({
    totalCVEs: 0,
    criticalCVEs: 0,
    kevCount: 0,
    maliciousIPCount: 0,
    activeTechniques: 0,
  })
  const [threatTrendsData, setThreatTrendsData] = useState([])

  useEffect(() => {
    const fetchAllIntelligence = async () => {
      try {
        setLoading(true)

        const [nvdResponse, cisaResponse, ipsResponse, mitreResponse, trendsResponse] = await Promise.all([
          fetch("/api/nvd?days=7&limit=100"),
          fetch("/api/cisa?days=7"),
          fetch("/api/abuseipdb/blacklist?limit=100"),
          fetch("/api/mitre"),
          fetch("/api/threat-trends"),
        ])

        const [nvd, cisa, ips, mitre, trends] = await Promise.all([
          nvdResponse.json(),
          cisaResponse.json(),
          ipsResponse.json(),
          mitreResponse.json(),
          trendsResponse.json(),
        ])

        if (nvd?.vulnerabilities) {
          setNvdData({
            vulnerabilities: nvd.vulnerabilities,
            stats: nvd.stats || {},
          })
        }

        if (cisa?.vulnerabilities) {
          setCisaData({
            vulnerabilities: cisa.vulnerabilities,
            stats: cisa.stats || {},
          })
        }

        if (ips?.data) {
          setMaliciousIPs(ips.data)
        }

        if (mitre?.techniques) {
          setMitreData({ techniques: mitre.techniques })
        }

        if (trends) {
          setThreatTrendsData(trends)
        }

        setThreatStats({
          totalCVEs: nvd?.totalResults || 0,
          criticalCVEs: nvd?.stats?.CRITICAL || 0,
          kevCount: cisa?.stats?.total || 0,
          maliciousIPCount: ips?.data?.length || 0,
          activeTechniques: mitre?.techniques?.length || 0,
        })
      } catch (error) {
        console.error("Error fetching dashboard intelligence:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllIntelligence()

    const interval = setInterval(fetchAllIntelligence, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getTopCriticalCVEs = () => {
    return nvdData.vulnerabilities
        .filter((vuln) => {
          const severity =
              vuln.cve?.processedData?.severity || vuln.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity
          return severity === "CRITICAL"
        })
        .slice(0, 5)
        .map((vuln) => ({
          id: vuln.cve?.id || "Unknown",
          severity: "CRITICAL",
          score: vuln.cve?.processedData?.score || vuln.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 0,
          title:
              vuln.cve?.processedData?.description?.substring(0, 80) ||
              vuln.cve?.descriptions?.[0]?.value?.substring(0, 80) ||
              "No description",
          time: vuln.cve?.published ? new Date(vuln.cve.published).toLocaleString() : "Unknown",
        }))
  }

  const getTopMitreTechniques = () => {
    const tacticCounts = {}
    mitreData.techniques.forEach((tech) => {
      tacticCounts[tech.tactic] = (tacticCounts[tech.tactic] || 0) + 1
    })
    return Object.entries(tacticCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
  }

  return (
      <div className="space-y-6">
        <div className="flex gap-4 w-full h-[200px]">
          <Card className="flex-[0.8] bg-gradient-to-r from-primary/20 to-accent/10 border-primary/50">
            <CardContent className="flex items-center justify-between h-full p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary animate-pulse" />
                  <h2 className="text-2xl font-bold text-foreground">Optimus Vulnerability Intelligence</h2>
                </div>
                <p className="text-muted-foreground">Real-time security intelligence aggregation</p>
                <div className="flex gap-4 mt-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total CVEs (7d)</p>
                    <p className="text-3xl font-bold text-primary">
                      {loading ? "..." : threatStats.totalCVEs.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Critical CVEs</p>
                    <p className="text-3xl font-bold text-destructive">{loading ? "..." : threatStats.criticalCVEs}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Malicious IPs</p>
                    <p className="text-3xl font-bold text-chart-2">{loading ? "..." : threatStats.maliciousIPCount}</p>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-8">
                <div className="text-center">
                                    <Image src="/optimus-shield.png" alt="Optimus Shield" width={64} height={64} className="mx-auto mb-2" />
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary">
                    {loading ? "Loading..." : "System Active"}
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
                                <Image src="/search.png" alt="Search" width={52} height={52} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-1">Quick Search</h3>
                <p className="text-xs text-muted-foreground">Click to search</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <AnimatedSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-card hover:bg-card/80 transition-colors border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total CVEs (7d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-foreground">
                  {loading ? "..." : threatStats.totalCVEs.toLocaleString()}
                </p>
                <AlertTriangle className="h-8 w-8 text-chart-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {loading ? "..." : `${nvdData.stats?.HIGH || 0} high severity`}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card hover:bg-card/80 transition-colors border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">CISA KEV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-foreground">
                  {loading ? "..." : threatStats.kevCount.toLocaleString()}
                </p>
                <Shield className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {loading ? "..." : `${cisaData.stats?.dueSoon || 0} due soon`}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card hover:bg-card/80 transition-colors border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Malicious IPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-foreground">
                  {loading ? "..." : threatStats.maliciousIPCount.toLocaleString()}
                </p>
                <Globe className="h-8 w-8 text-chart-5" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">High confidence</p>
            </CardContent>
          </Card>

          <Card className="bg-card hover:bg-card/80 transition-colors border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">MITRE Techniques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-foreground">
                  {loading ? "..." : threatStats.activeTechniques.toLocaleString()}
                </p>
                <Target className="h-8 w-8 text-chart-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">ATT&CK framework</p>
            </CardContent>
          </Card>

          <Card className="bg-card hover:bg-card/80 transition-colors border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-foreground">6</p>
                <Database className="h-8 w-8 text-chart-3" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">All active</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cves">Top CVEs</TabsTrigger>
            <TabsTrigger value="ips">Malicious IPs</TabsTrigger>
            <TabsTrigger value="kev">KEV Catalog</TabsTrigger>
            <TabsTrigger value="mitre">MITRE ATT&CK</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-card border-border overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-foreground">Threat Trends (30 Days)</CardTitle>
                  <CardDescription>CVE discoveries and exploit activity over time</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <ThreatLineChart data={threatTrendsData} />
                </CardContent>
              </Card>

              <Card className="bg-card border-border overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground">Severity Distribution</CardTitle>
                  <CardDescription>Last 7 days breakdown</CardDescription>
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
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Activity className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading critical alerts...</span>
                    </div>
                ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {getTopCriticalCVEs().map((alert) => (
                            <div
                                key={alert.id}
                                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border cursor-pointer"
                                onClick={() => window.open(`/nvd/${alert.id}`, "_blank")}
                            >
                              <div className="flex items-center gap-4">
                                <Badge variant="destructive" className="w-20 justify-center">
                                  {alert.severity}
                                </Badge>
                                <div>
                                  <p className="font-mono font-semibold text-foreground">{alert.id}</p>
                                  <p className="text-sm text-muted-foreground">{alert.title}...</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">{alert.score.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">{alert.time}</p>
                              </div>
                            </div>
                        ))}
                      </div>
                    </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cves" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Top Hunted CVEs (Last 7 Days)</CardTitle>
                <CardDescription>Most critical vulnerabilities discovered recently</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Activity className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading CVE data...</span>
                    </div>
                ) : (
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-3">
                        {nvdData.vulnerabilities.slice(0, 20).map((vuln) => {
                          const cveData = vuln.cve?.processedData || {}
                          const severity =
                              cveData.severity || vuln.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || "UNKNOWN"
                          const score = cveData.score || vuln.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 0
                          const description = cveData.description || vuln.cve?.descriptions?.[0]?.value || "No description"

                          return (
                              <div
                                  key={vuln.cve?.id}
                                  className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border cursor-pointer"
                                  onClick={() => window.open(`/nvd/${vuln.cve?.id}`, "_blank")}
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge
                                      variant={
                                        severity === "CRITICAL" ? "destructive" : severity === "HIGH" ? "default" : "secondary"
                                      }
                                  >
                                    {severity}
                                  </Badge>
                                  <span className="font-mono font-bold text-foreground">{vuln.cve?.id}</span>
                                  <span className="text-lg font-bold text-primary">{score.toFixed(1)}</span>
                                </div>
                                <p className="text-sm text-foreground mb-2">{description.substring(0, 200)}...</p>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>
                              Vendor: <span className="text-foreground">{cveData.vendor || "Unknown"}</span>
                            </span>
                                  <span>
                              Product: <span className="text-foreground">{cveData.product || "Unknown"}</span>
                            </span>
                                  <span>
                              Published:{" "}
                                    <span className="text-foreground">
                                {vuln.cve?.published ? new Date(vuln.cve.published).toLocaleDateString() : "Unknown"}
                              </span>
                            </span>
                                </div>
                              </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ips" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Live Malicious IP Addresses</CardTitle>
                <CardDescription>Top reported malicious IPs from AbuseIPDB</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Activity className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading malicious IPs...</span>
                    </div>
                ) : (
                    <ScrollArea className="h-[600px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {maliciousIPs.slice(0, 50).map((ip, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono font-bold text-foreground">{ip.ipAddress}</span>
                                <Badge variant={ip.abuseConfidenceScore >= 90 ? "destructive" : "default"}>
                                  {ip.abuseConfidenceScore}%
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground space-y-1">
                                {ip.countryCode && (
                                    <div>
                                      Country: <span className="text-foreground">{ip.countryCode}</span>
                                    </div>
                                )}
                                {ip.lastReportedAt && (
                                    <div>
                                      Last Reported:{" "}
                                      <span className="text-foreground">{new Date(ip.lastReportedAt).toLocaleString()}</span>
                                    </div>
                                )}
                              </div>
                            </div>
                        ))}
                      </div>
                    </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kev" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">CISA Known Exploited Vulnerabilities</CardTitle>
                <CardDescription>Vulnerabilities actively exploited in the wild</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Activity className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading KEV catalog...</span>
                    </div>
                ) : (
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-3">
                        {cisaData.vulnerabilities.slice(0, 30).map((vuln, idx) => {
                          const daysUntilDue = Math.ceil(
                              (new Date(vuln.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                          )
                          const isUrgent = daysUntilDue <= 7

                          return (
                              <div
                                  key={idx}
                                  className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  {isUrgent && <AlertCircle className="h-4 w-4 text-destructive" />}
                                  <span className="font-mono font-bold text-foreground">{vuln.cveID}</span>
                                  <Badge variant={isUrgent ? "destructive" : "default"}>Due in {daysUntilDue} days</Badge>
                                </div>
                                <p className="text-sm font-semibold text-foreground mb-1">{vuln.vulnerabilityName}</p>
                                <p className="text-sm text-muted-foreground mb-2">{vuln.shortDescription}</p>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>
                              Vendor: <span className="text-foreground">{vuln.vendorProject}</span>
                            </span>
                                  <span>
                              Product: <span className="text-foreground">{vuln.product}</span>
                            </span>
                                  <span>
                              Added:{" "}
                                    <span className="text-foreground">{new Date(vuln.dateAdded).toLocaleDateString()}</span>
                            </span>
                                </div>
                              </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mitre" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Top Tactics</CardTitle>
                  <CardDescription>Most common attack tactics</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                      <div className="flex items-center justify-center p-8">
                        <Activity className="h-6 w-6 animate-spin" />
                      </div>
                  ) : (
                      <div className="space-y-3">
                        {getTopMitreTechniques().map(([tactic, count], idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                              <span className="font-semibold text-foreground">{tactic}</span>
                              <Badge variant="default">{count} techniques</Badge>
                            </div>
                        ))}
                      </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Techniques</CardTitle>
                  <CardDescription>Latest MITRE ATT&CK techniques</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                      <div className="flex items-center justify-center p-8">
                        <Activity className="h-6 w-6 animate-spin" />
                      </div>
                  ) : (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-3">
                          {mitreData.techniques.slice(0, 20).map((tech, idx) => (
                              <div
                                  key={idx}
                                  className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">{tech.tactic}</Badge>
                                  <span className="font-mono text-sm text-foreground">{tech.id}</span>
                                </div>
                                <p className="text-sm font-semibold text-foreground">{tech.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">{tech.description.substring(0, 100)}...</p>
                              </div>
                          ))}
                        </div>
                      </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  )
}
