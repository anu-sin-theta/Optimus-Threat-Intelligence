"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell, Settings, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import DashboardTab from "@/components/dashboard-tab"
import VulnerabilitiesTab from "@/components/vulnerabilities-tab"
import CisaKevTab from "@/components/cisa-kev-tab"
import CyberNewsTab from "@/components/cyber-news-tab"
import MaliciousIpsTab from "@/components/malicious-ips-tab"
import MitreAttackTab from "@/components/mitre-attack-tab"
import AutomationTab from "@/components/automation-tab"
import LogsTab from "@/components/logs-tab"
import RedHatTab from "@/components/redhat-tab"
import OptiWatcherTab from "@/components/opti-watcher-tab"
import OptiAbusedTab from "@/components/opti-abused-tab"
import { navigationItems } from "@/config/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { logout } from "@/hooks/use-auth"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/landing")
    }
  }, [user, loading, router])

  if (loading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      await logout()
      router.push("/landing")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen bg-background dark flex w-full">
          <Sidebar collapsible="offcanvas">
            <SidebarHeader className="border-b border-border">
              <div className="flex items-center gap-3 px-2 py-3">
                <Image src="/logo.png" alt="Optimus" width={720} height={300} className="h-40 w-auto" priority />
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation Tools</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const isActive = activeTab === item.id

                      return (
                          <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton
                                onClick={() => setActiveTab(item.id)}
                                isActive={isActive}
                                tooltip={item.description}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-border p-4">
              <div className="flex items-center justify-center">
                <Image
                    src="/footer-optimus.png"
                    alt="Optimus by Anu"
                    width={240}
                    height={280}
                    className="w-full h-auto max-w-[200px] group-data-[collapsible=icon]:max-w-[48px]"
                    priority
                />
              </div>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset>
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
              <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <SidebarTrigger />
                  <Image
                      src="/logo.png"
                      alt="Optimus Threat Intelligence Platform"
                      width={720}
                      height={200}
                      className="h-12 w-auto md:hidden"
                      priority
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search threats, CVEs, IOCs..."
                        className="w-64 pl-9 bg-background border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setActiveTab("automation")}>
                        Automation & Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

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

                <TabsContent value="iocs" className="space-y-6">
                  <MaliciousIpsTab />
                </TabsContent>

                <TabsContent value="news" className="space-y-6">
                  <CyberNewsTab />
                </TabsContent>

                <TabsContent value="logs" className="space-y-6">
                  <LogsTab />
                </TabsContent>

                <TabsContent value="opti-abused" className="space-y-6">
                  <OptiAbusedTab />
                </TabsContent>

                <TabsContent value="opti-watcher" className="space-y-6">
                  <OptiWatcherTab searchQuery={searchQuery} />
                </TabsContent>

                <TabsContent value="automation" className="space-y-6">
                  <AutomationTab />
                </TabsContent>
              </Tabs>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
  )
}
