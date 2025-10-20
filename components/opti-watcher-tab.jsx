"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Shield, AlertTriangle, Info, Maximize } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import VulnerabilityGraph from "./vulnerability-graph"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const ITEMS_PER_PAGE = 15;

export default function OptiWatcherTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [itemsToShow, setItemsToShow] = useState(ITEMS_PER_PAGE);
  const [selectedCve, setSelectedCve] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [isGraphLoading, setIsGraphLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/enriched-vulnerabilities")
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Error fetching enriched vulnerabilities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLoadMore = () => {
    setItemsToShow(prev => prev + ITEMS_PER_PAGE);
  };

  const handleCveClick = async (cveId) => {
    if (selectedCve === cveId) {
      setSelectedCve(null);
      setGraphData(null);
      return;
    }

    setSelectedCve(cveId);
    setIsGraphLoading(true);
    try {
      const response = await fetch(`/api/vulnerability-graph/${cveId}`);
      const result = await response.json();
      setGraphData(result);
    } catch (error) {
      console.error("Error fetching graph data:", error);
    } finally {
      setIsGraphLoading(false);
    }
  };

  return (
    <Card className="w-full h-full bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Opti Watcher - Enriched Vulnerability Data</CardTitle>
        <CardDescription>Combined and enriched data from NVD, CISA KEV, cvelistV5, Red Hat, and MITRE ATT&CK</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Activity className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading enriched data...</span>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              {data?.vulnerabilities?.slice(0, itemsToShow).map((vuln) => (
                <Card key={vuln.id} className="bg-secondary/50 border-border">
                  <CardHeader className="cursor-pointer" onClick={() => handleCveClick(vuln.id)}>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>{vuln.id}</span>
                      {vuln.isKnownExploited && (
                        <Badge variant="destructive"><Shield className="h-3 w-3 mr-1" />Known Exploited</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{vuln.descriptions?.[0]?.value}</CardDescription>
                  </CardHeader>
                  {selectedCve === vuln.id && (
                    <CardContent className="space-y-4">
                      {isGraphLoading ? (
                        <div className="flex items-center justify-center p-8">
                          <Activity className="h-6 w-6 animate-spin" />
                          <span className="ml-2">Loading graph...</span>
                        </div>
                      ) : (
                        <>
                          {vuln.redhatAdvisories && vuln.redhatAdvisories.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Red Hat Advisories</h4>
                              <div className="flex flex-wrap gap-2">
                                {vuln.redhatAdvisories.map((advisory) => (
                                  <a href={advisory.resource_url} target="_blank" rel="noopener noreferrer" key={advisory.id}>
                                    <Badge variant="secondary">{advisory.id} - {advisory.severity}</Badge>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold mb-2">MITRE ATT&CK</h4>
                            {vuln.mitreAttack && vuln.mitreAttack.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {vuln.mitreAttack.map((technique) => (
                                  <a href={technique.url} target="_blank" rel="noopener noreferrer" key={technique.id}>
                                    <Badge variant="outline">{technique.id.split('-')[0]} - {technique.name}</Badge>
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No MITRE ATT&CK techniques referenced.</p>
                            )}
                          </div>
                          {vuln.abuseIpdbInfo && vuln.abuseIpdbInfo.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Related Malicious IPs</h4>
                              <div className="flex flex-wrap gap-2">
                                {vuln.abuseIpdbInfo.map((ip) => (
                                  <Badge key={ip.ipAddress} variant="destructive">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {ip.ipAddress} (Confidence: {ip.abuseConfidenceScore}%)
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="relative pt-4 h-[400px]">
                            <VulnerabilityGraph data={graphData} />
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="absolute bottom-2 right-2">
                                  <Maximize className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent style={{ width: '1200px', height: '800px' }} className="flex flex-col">
                                <DialogHeader className="p-6">
                                  <DialogTitle>Vulnerability Graph: {vuln.id}</DialogTitle>
                                </DialogHeader>
                                <div className="flex-grow">
                                  <VulnerabilityGraph data={graphData} />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
            {data?.vulnerabilities?.length > itemsToShow && (
              <div className="flex justify-center mt-4">
                <Button onClick={handleLoadMore}>Load More</Button>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}