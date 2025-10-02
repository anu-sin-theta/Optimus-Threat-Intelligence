"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"

export default function VulnersTab() {
  const exploits = [
    {
      id: "EDB-51234",
      cve: "CVE-2024-1234",
      title: "Apache Struts RCE Exploit",
      type: "Remote",
      verified: true,
      date: "2024-01-15",
    },
    {
      id: "EDB-51235",
      cve: "CVE-2024-5678",
      title: "WordPress Plugin SQLi",
      type: "WebApp",
      verified: true,
      date: "2024-01-14",
    },
    {
      id: "EDB-51236",
      cve: "CVE-2024-9012",
      title: "Windows Privilege Escalation",
      type: "Local",
      verified: false,
      date: "2024-01-13",
    },
    {
      id: "EDB-51237",
      cve: "CVE-2024-3456",
      title: "Cisco IOS Authentication Bypass",
      type: "Remote",
      verified: true,
      date: "2024-01-12",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Exploits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">15,432</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-2">8,765</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Remote Exploits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">4,321</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-foreground">89</p>
              <TrendingUp className="h-5 w-5 text-chart-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Vulners Exploit Database</CardTitle>
          <CardDescription>Community-verified exploits and proof-of-concepts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exploits.map((exploit) => (
              <div
                key={exploit.id}
                className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {exploit.verified && (
                        <Badge variant="default" className="bg-chart-2 text-white">
                          Verified
                        </Badge>
                      )}
                      <Badge variant="outline">{exploit.type}</Badge>
                      <span className="font-mono text-sm text-muted-foreground">{exploit.id}</span>
                      <span className="font-mono text-sm text-primary">{exploit.cve}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">{exploit.title}</p>
                    <p className="text-xs text-muted-foreground">Published: {exploit.date}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Exploit
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
