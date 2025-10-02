"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Grid3x3, X, Search, Bell, Settings } from "lucide-react"
import Image from "next/image"
import DashboardTab from "@/components/dashboard-tab"
import VulnerabilitiesTab from "@/components/vulnerabilities-tab"
import CisaKevTab from "@/components/cisa-kev-tab"
import CyberNewsTab from "@/components/cyber-news-tab"
import MaliciousIocsTab from "@/components/malicious-iocs-tab"
import MitreAttackTab from "@/components/mitre-attack-tab"
import AutomationTab from "@/components/automation-tab"
import LogsTab from "@/components/logs-tab"
import RedHatTab from "@/components/redhat-tab"
import VulnersTab from "@/components/vulners-tab"
import ResultsTab from "@/components/results-tab"
import { navigationItems } from "@/config/navigation"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleNavigationClick = (tabId: string) => {
    setActiveTab(tabId)
    setIsToolsMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Optimus Threat Intelligence Platform"
              width={720}
              height={200}
              className="h-48 w-auto"
              priority
            />
          </div>

          <div className="absolute left-1/2 -translate-x-1/2">
            <Button
              onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
              className={`relative px-6 py-2 font-semibold transition-all duration-300 ${
                isToolsMenuOpen
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                  : "bg-primary/80 hover:bg-primary hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              }`}
            >
              <Grid3x3 className="mr-2 h-5 w-5" />
              Tools
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search threats, CVEs, IOCs..."
                className="w-64 pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tools Menu Card */}
      {isToolsMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsToolsMenuOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="mx-4 w-full max-w-4xl rounded-lg border border-border bg-card p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Navigation Tools</h2>
                  <p className="text-sm text-muted-foreground">Select a tool to access threat intelligence data</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsToolsMenuOpen(false)} className="h-8 w-8">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigationClick(item.id)}
                      className={`group relative flex items-start gap-4 rounded-lg border p-4 text-left transition-all duration-200 ${
                        isActive
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border bg-card hover:border-primary/50 hover:bg-accent"
                      }`}
                    >
                      <div
                        className={`rounded-md p-2 transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.label}</h3>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      {isActive && (
                        <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden">
            {navigationItems.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="vulnerabilities" className="space-y-6">
            <VulnerabilitiesTab />
          </TabsContent>

          <TabsContent value="cisa-kev" className="space-y-6">
            <CisaKevTab />
          </TabsContent>

          <TabsContent value="redhat" className="space-y-6">
            <RedHatTab />
          </TabsContent>

          <TabsContent value="mitre" className="space-y-6">
            <MitreAttackTab />
          </TabsContent>

          <TabsContent value="vulners" className="space-y-6">
            <VulnersTab />
          </TabsContent>

          <TabsContent value="iocs" className="space-y-6">
            <MaliciousIocsTab />
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <CyberNewsTab />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <LogsTab />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <ResultsTab />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <AutomationTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}