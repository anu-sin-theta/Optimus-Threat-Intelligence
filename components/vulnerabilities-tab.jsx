"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, Filter, RotateCw, X } from "lucide-react"
import { intelligentSearch } from "@/lib/search"
import { useDebounce } from "@/hooks/use-debounce"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function VulnerabilitiesTab() {
  const router = useRouter()
  const [vulnerabilities, setVulnerabilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVuln, setSelectedVuln] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isNotFoundDialogOpen, setIsNotFoundDialogOpen] = useState(false)
  const [severityFilters, setSeverityFilters] = useState(new Set())
  const [timePeriod, setTimePeriod] = useState('7')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalVulnerabilities, setTotalVulnerabilities] = useState(0)
  const [stats, setStats] = useState({ CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0 })
  const [isCweDialogOpen, setIsCweDialogOpen] = useState(false);
  const [selectedCwe, setSelectedCwe] = useState(null);
  const [cweDetails, setCweDetails] = useState(null);
  const [cweLoading, setCweLoading] = useState(false);
  const VULNS_PER_PAGE = 50;
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const fetchVulnerabilities = async (forceUpdate = false, page = 1) => {
    try {
      setLoading(true)
      const offset = (page - 1) * VULNS_PER_PAGE;
      const severityFilterString = Array.from(severityFilters).join(',');
      let url = `/api/nvd?days=${timePeriod}&limit=${VULNS_PER_PAGE}&offset=${offset}`;
      if (forceUpdate) {
        url += '&forceUpdate=true';
      }
      if (severityFilterString) {
        url += `&severity=${severityFilterString}`;
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data?.vulnerabilities) {
        setTotalVulnerabilities(data.totalResults || 0);
        setStats(data.stats || { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0 });

        // Format the vulnerabilities data
        const formattedVulns = data.vulnerabilities
          .filter(vuln => vuln && vuln.cve) // Filter out null or undefined entries
          .map((vuln, index) => {
            // Get the primary description in English
            const description = vuln.cve.descriptions?.find(desc => desc.lang === 'en')?.value ||
              vuln.cve.descriptions?.[0]?.value ||
              'No description available';

            // Get CVSS data with fallbacks
            const cvssData = vuln.cve.metrics?.cvssMetricV31?.[0]?.cvssData ||
                           vuln.cve.metrics?.cvssMetricV30?.[0]?.cvssData ||
                           vuln.cve.metrics?.cvssMetricV2?.[0]?.cvssData;

            // Get vendor and product info
            const vendorInfo = vuln.cve.configurations?.[0]?.nodes?.[0]?.cpeMatch?.[0] || {};
            const vendor = vendorInfo.criteria?.split(':')[3] || 'Unknown';
            const product = vendorInfo.criteria?.split(':')[4] || 'Unknown';

            const publishedDate = vuln.cve.published ? new Date(vuln.cve.published) : null;
            const modifiedDate = vuln.cve.lastModified ? new Date(vuln.cve.lastModified) : null;
            let isReattacked = false;
            if (publishedDate && modifiedDate) {
              const oneYear = 365 * 24 * 60 * 60 * 1000;
              if (modifiedDate.getTime() - publishedDate.getTime() > oneYear) {
                isReattacked = true;
              }
            }

            return {
              id: vuln.cve.id || `vuln-${index}`, // Ensure unique ID
              description,
              severity: cvssData?.baseSeverity || 'UNKNOWN',
              score: cvssData?.baseScore || 0,
              vector: cvssData?.vectorString || '',
              vendor,
              product,
              published: publishedDate ? publishedDate.toLocaleDateString() : 'Unknown',
              modified: modifiedDate ? modifiedDate.toLocaleDateString() : 'Unknown',
              isReattacked,
              references: vuln.cve.references || [],
              metrics: vuln.cve.metrics || {},
              weaknesses: vuln.cve.weaknesses || [],
              raw: vuln // Keep raw data for debugging
            };
        });

        console.log('Formatted vulnerabilities:', formattedVulns[0]); // Debug log
        setVulnerabilities(formattedVulns)
      } else {
        setVulnerabilities([])
        console.warn('No vulnerabilities data received:', data)
      }
    } catch (error) {
      console.error("Error fetching vulnerabilities:", error)
      setVulnerabilities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVulnerabilities(false, currentPage);
  }, [currentPage, timePeriod, severityFilters])

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery) {
        fetchVulnerabilities()
        return
      }

      setIsSearching(true)
      try {
        const results = await intelligentSearch(debouncedSearchQuery, ['nvd'], false)
        const nvdResults = results.find(r => r.source === 'nvd')
        if (nvdResults?.data && nvdResults.data.length > 0) {
          // Format the search results using the same structure
          const formattedVulns = nvdResults.data.map(vuln => ({
            id: vuln.cve?.id || 'Unknown',
            description: vuln.cve?.descriptions?.[0]?.value || 'No description available',
            severity: vuln.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || 'UNKNOWN',
            score: vuln.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 0,
            vendor: vuln.cve?.affected?.[0]?.vendor || 'Unknown',
            product: vuln.cve?.affected?.[0]?.product || 'Unknown',
            published: vuln.cve?.published ? new Date(vuln.cve.published).toLocaleDateString() : 'Unknown',
            modified: vuln.cve?.lastModified ? new Date(vuln.cve.lastModified).toLocaleDateString() : 'Unknown',
            references: vuln.cve?.references || [],
            metrics: vuln.cve?.metrics || {},
            weaknesses: vuln.cve?.weaknesses || []
          }));
          setVulnerabilities(formattedVulns)
        } else {
          // If not found in cache, force update
          const updatedResults = await intelligentSearch(debouncedSearchQuery, ['nvd'], true)
          const updatedNvdResults = updatedResults.find(r => r.source === 'nvd')
          if (updatedNvdResults?.data && updatedNvdResults.data.length > 0) {
            const formattedVulns = updatedNvdResults.data.map(vuln => ({
              id: vuln.cve?.id || 'Unknown',
              description: vuln.cve?.descriptions?.[0]?.value || 'No description available',
              severity: vuln.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || 'UNKNOWN',
              score: vuln.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 0,
              vendor: vuln.cve?.affected?.[0]?.vendor || 'Unknown',
              product: vuln.cve?.affected?.[0]?.product || 'Unknown',
              published: vuln.cve?.published ? new Date(vuln.cve.published).toLocaleDateString() : 'Unknown',
              modified: vuln.cve?.lastModified ? new Date(vuln.cve.lastModified).toLocaleDateString() : 'Unknown',
              references: vuln.cve?.references || [],
              metrics: vuln.cve?.metrics || {},
              weaknesses: vuln.cve?.weaknesses || []
            }));
            setVulnerabilities(formattedVulns)
          } else {
            setVulnerabilities([]);
            setIsNotFoundDialogOpen(true);
          }
        }
      } catch (error) {
        console.error('Error performing search:', error)
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedSearchQuery])

  const handleViewDetails = (vuln) => {
    router.push(`/nvd/${vuln.id}`)
  }

  const handleCweClick = async (cweId) => {
    setSelectedCwe(cweId);
    setIsCweDialogOpen(true);
    setCweLoading(true);
    try {
      const response = await fetch(`/api/cwe/${cweId}`);
      let data;

      if (!response.ok) {
        throw new Error(`Failed to fetch CWE details (status: ${response.status})`);
      }

      try {
        data = await response.json();
      } catch (error) {
        console.error("Failed to parse CWE API response:", error);
        throw new Error("Invalid response format from CWE API");
      }

      if (data.Weaknesses && data.Weaknesses.length > 0) {
        setCweDetails(data.Weaknesses[0]);
      } else {
        throw new Error("No weakness details found in the response");
      }
    } catch (error) {
      console.error("Error fetching CWE details:", error);
      setCweDetails({
        ID: cweId,
        Name: 'Error',
        Description: error.message
      });
    } finally {
      setCweLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                isSearching ? 'animate-spin text-primary' : 'text-muted-foreground'
              }`} />
              <Input
                type="search"
                placeholder="Search by CVE ID, vendor, product..."
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => { setCurrentPage(1); fetchVulnerabilities(true, 1); }}
              disabled={loading}
            >
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Updating...' : 'Force Update'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  {severityFilters.size > 0 && (
                    <Badge variant="secondary" className="ml-2">{severityFilters.size}</Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Severity</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'].map((severity) => (
                  <DropdownMenuCheckboxItem
                    key={severity}
                    checked={severityFilters.has(severity)}
                    onCheckedChange={() => {
                      const newFilters = new Set(severityFilters);
                      if (newFilters.has(severity)) {
                        newFilters.delete(severity);
                      } else {
                        newFilters.add(severity);
                      }
                      setSeverityFilters(newFilters);
                    }}
                  >
                    {severity}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{stats.CRITICAL}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">High</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-5">{stats.HIGH}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Medium</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-4">{stats.MEDIUM}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-2">{totalVulnerabilities}</p>
          </CardContent>
        </Card>
      </div>

      {/* Vulnerabilities Table */}
      <Card className="bg-card border-border">
        <CardHeader className="flex items-center">
          <div className="w-1/3">
            <CardTitle className="text-foreground">NVD Vulnerabilities</CardTitle>
            <CardDescription>Latest CVE entries from National Vulnerability Database</CardDescription>
          </div>
          <div className="w-1/3 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">{currentPage}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalVulnerabilities / VULNS_PER_PAGE), p + 1))} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          <div className="w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <RotateCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading vulnerabilities...</span>
              </div>
            ) : vulnerabilities.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                No vulnerabilities found matching your criteria
              </div>
            ) : (
              vulnerabilities.map((vuln) => (
                <div
                  key={vuln.id}
                  className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant={
                            vuln.severity === "CRITICAL"
                              ? "destructive"
                              : vuln.severity === "HIGH"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {vuln.severity}
                        </Badge>
                        <span className="font-mono font-bold text-foreground">{vuln.id}</span>
                        <span className="text-lg font-bold text-primary">{vuln.score}</span>
                      </div>
                      <p className="text-sm text-foreground mb-1">{vuln.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>
                          Vendor: <span className="text-foreground">{vuln.vendor}</span>
                        </span>
                        <span>
                          Product: <span className="text-foreground">{vuln.product}</span>
                        </span>
                        <span>
                          Published: <span className="text-foreground">{vuln.published}</span>
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(vuln)}>
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>


      <AlertDialog open={isNotFoundDialogOpen} onOpenChange={setIsNotFoundDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Not Found</AlertDialogTitle>
            <AlertDialogDescription>
              No vulnerabilities found matching your query. Would you like to force an update of the database?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                fetchVulnerabilities(true);
                setIsNotFoundDialogOpen(false);
              }}
            >
              Force Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isCweDialogOpen} onOpenChange={setIsCweDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 gap-0">
          <div className="sticky top-0 z-50 flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 border-b">
            <div>
              <DialogTitle className="text-xl">
                CWE-{cweDetails?.ID}: {cweDetails?.Name}
              </DialogTitle>
              <DialogDescription className="flex gap-2 text-sm mt-1">
                <Badge variant="outline">{cweDetails?.Abstraction}</Badge>
                <Badge variant="outline">{cweDetails?.Structure}</Badge>
                <Badge variant="outline">{cweDetails?.Status}</Badge>
                <Badge variant={cweDetails?.LikelihoodOfExploit === "High" ? "destructive" :
                              cweDetails?.LikelihoodOfExploit === "Medium" ? "default" : "secondary"}>
                  {cweDetails?.LikelihoodOfExploit} Likelihood
                </Badge>
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              className="h-6 w-6 p-0 rounded-md"
              onClick={() => setIsCweDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-full max-h-[calc(95vh-80px)] p-6">
            {cweLoading ? (
              <div className="flex items-center justify-center p-8">
                <RotateCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading CWE details...</span>
              </div>
            ) : cweDetails ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start bg-muted/50 p-0 h-12">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-background rounded-none h-12">Overview</TabsTrigger>
                  <TabsTrigger value="technical" className="data-[state=active]:bg-background rounded-none h-12">Technical Details</TabsTrigger>
                  <TabsTrigger value="detection" className="data-[state=active]:bg-background rounded-none h-12">Detection & Mitigation</TabsTrigger>
                  <TabsTrigger value="examples" className="data-[state=active]:bg-background rounded-none h-12">Examples & References</TabsTrigger>
                  <TabsTrigger value="metadata" className="data-[state=active]:bg-background rounded-none h-12">Metadata</TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                  <TabsContent value="overview" className="m-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{cweDetails.Description}</p>
                          {cweDetails.ExtendedDescription && (
                            <Collapsible className="mt-4">
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2">
                                  Extended Description
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <p className="text-muted-foreground mt-2">{cweDetails.ExtendedDescription}</p>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </CardContent>
                      </Card>

                      {cweDetails.CommonConsequences?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Common Consequences</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {cweDetails.CommonConsequences.map((cc, idx) => (
                                <div key={idx} className="p-4 rounded-lg border bg-muted/50">
                                  <div className="flex gap-2 mb-2">
                                    {cc.Scope?.map((scope, i) => (
                                      <Badge key={i} variant="secondary">{scope}</Badge>
                                    ))}
                                  </div>
                                  <div className="flex gap-2 mb-2">
                                    {cc.Impact?.map((impact, i) => (
                                      <Badge key={i} variant="outline">{impact}</Badge>
                                    ))}
                                  </div>
                                  {cc.Note && (
                                    <p className="text-sm text-muted-foreground mt-2">{cc.Note}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {cweDetails.ApplicablePlatforms?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Applicable Platforms</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              {cweDetails.ApplicablePlatforms.map((ap, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <Badge variant="outline">{ap.Type}</Badge>
                                  <span>{ap.Name || ap.Class}</span>
                                  <Badge variant="secondary">{ap.Prevalence}</Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {cweDetails.AlternateTerms?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Alternate Terms</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {cweDetails.AlternateTerms.map((at, idx) => (
                                <Collapsible key={idx}>
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 w-full justify-start">
                                      {at.Term}
                                    </Button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <p className="text-sm text-muted-foreground mt-2">{at.Description}</p>
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="m-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {cweDetails.RelatedWeaknesses?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Related Weaknesses</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {cweDetails.RelatedWeaknesses.map((rw, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/50">
                                  <Badge variant="default" className="font-mono">CWE-{rw.CweID}</Badge>
                                  <Badge variant="outline">{rw.Nature}</Badge>
                                  {rw.Ordinal && <Badge variant="secondary">{rw.Ordinal}</Badge>}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {cweDetails.WeaknessOrdinalities?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Weakness Ordinalities</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {cweDetails.WeaknessOrdinalities.map((wo, idx) => (
                                <div key={idx} className="p-4 rounded-lg border bg-muted/50">
                                  <Badge variant="default" className="mb-2">{wo.Ordinality}</Badge>
                                  <p className="text-sm text-muted-foreground">{wo.Description}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {cweDetails.ModesOfIntroduction?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Modes of Introduction</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {cweDetails.ModesOfIntroduction.map((mi, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/50">
                                  <Badge variant="default">{mi.Phase}</Badge>
                                  {mi.Note && <p className="text-sm text-muted-foreground">{mi.Note}</p>}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="detection" className="m-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {cweDetails.DetectionMethods?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Detection Methods</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {cweDetails.DetectionMethods.map((dm, idx) => (
                                <Collapsible key={idx}>
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="flex items-center justify-between w-full">
                                      <span>{dm.Method}</span>
                                      {dm.Effectiveness && (
                                        <Badge variant={
                                          dm.Effectiveness.includes("High") ? "default" :
                                          dm.Effectiveness.includes("SOAR") ? "secondary" : "outline"
                                        }>
                                          {dm.Effectiveness}
                                        </Badge>
                                      )}
                                    </Button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{dm.Description}</p>
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {cweDetails.PotentialMitigations?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Potential Mitigations</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {cweDetails.PotentialMitigations.map((pm, idx) => (
                                <Collapsible key={idx}>
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 w-full justify-start">
                                      {pm.Phase?.join(", ")}
                                      {pm.Strategy && <Badge variant="outline">{pm.Strategy}</Badge>}
                                    </Button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="space-y-2">
                                    <p className="text-sm text-muted-foreground mt-2">{pm.Description}</p>
                                    {pm.Effectiveness && (
                                      <Badge variant="secondary">Effectiveness: {pm.Effectiveness}</Badge>
                                    )}
                                    {pm.EffectivenessNotes && (
                                      <p className="text-xs text-muted-foreground">{pm.EffectivenessNotes}</p>
                                    )}
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="examples" className="m-0">
                    <div className="grid grid-cols-1 gap-6">
                      {cweDetails.DemonstrativeExamples?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Demonstrative Examples</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-6">
                              {cweDetails.DemonstrativeExamples.map((ex, idx) => (
                                <Collapsible key={idx}>
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 w-full justify-start">
                                      Example {idx + 1}
                                      {ex.ID && <Badge variant="outline">{ex.ID}</Badge>}
                                    </Button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-4">
                                    {ex.Entries?.map((entry, eidx) => (
                                      <div key={eidx} className="mb-4">
                                        {entry.IntroText && (
                                          <p className="font-medium mb-2">{entry.IntroText}</p>
                                        )}
                                        {entry.BodyText && (
                                          <p className="text-sm text-muted-foreground mb-2">{entry.BodyText}</p>
                                        )}
                                        {entry.ExampleCode && (
                                          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto mb-2">
                                            <div className="flex justify-between items-center mb-2">
                                              {entry.Nature && <Badge variant="outline">{entry.Nature}</Badge>}
                                              {entry.Language && <Badge variant="secondary">{entry.Language}</Badge>}
                                            </div>
                                            <code>{entry.ExampleCode}</code>
                                          </pre>
                                        )}
                                      </div>
                                    ))}
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {cweDetails.ObservedExamples?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Observed Examples (CVEs)</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {cweDetails.ObservedExamples.map((oe, idx) => (
                                <div key={idx} className="p-4 rounded-lg border bg-muted/50">
                                  <a
                                    href={oe.Link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline font-medium"
                                  >
                                    {oe.Reference}
                                  </a>
                                  <p className="text-sm text-muted-foreground mt-2">{oe.Description}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {cweDetails.References?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>References</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {cweDetails.References.map((ref, idx) => (
                                <div key={idx} className="p-4 rounded-lg border bg-muted/50">
                                  {ref.URL ? (
                                    <a
                                      href={ref.URL}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline font-medium"
                                    >
                                      {ref.Title || ref.ExternalReferenceID}
                                    </a>
                                  ) : (
                                    <span className="font-medium">{ref.Title || ref.ExternalReferenceID}</span>
                                  )}
                                  <div className="text-sm text-muted-foreground mt-2">
                                    {ref.Authors && <span>by {ref.Authors.join(', ')}</span>}
                                    {ref.PublicationYear && <span> ({ref.PublicationYear})</span>}
                                    {ref.Section && <span> - {ref.Section}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="metadata" className="m-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {cweDetails.FunctionalAreas?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Functional Areas</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {cweDetails.FunctionalAreas.map((fa, idx) => (
                                <Badge key={idx} variant="outline">{fa}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {cweDetails.AffectedResources?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Affected Resources</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {cweDetails.AffectedResources.map((ar, idx) => (
                                <Badge key={idx} variant="outline">{ar}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {cweDetails.TaxonomyMappings?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Taxonomy Mappings</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {cweDetails.TaxonomyMappings.map((tm, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <Badge variant="default">{tm.TaxonomyName}</Badge>
                                  <span>{tm.EntryName || tm.EntryID}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {cweDetails.ContentHistory?.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Content History</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {cweDetails.ContentHistory.map((ch, idx) => (
                                <Collapsible key={idx}>
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 w-full justify-start">
                                      <Badge variant="outline">{ch.Type}</Badge>
                                      <span>{ch.SubmissionDate || ch.ModificationDate || ch.ContributionDate || ch.Date}</span>
                                    </Button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="space-y-2 mt-2 text-sm text-muted-foreground">
                                    {ch.ModificationComment && <p>{ch.ModificationComment}</p>}
                                    {ch.ContributionComment && <p>{ch.ContributionComment}</p>}
                                    {ch.SubmissionVersion && <Badge variant="secondary">v{ch.SubmissionVersion}</Badge>}
                                    {ch.ModificationVersion && <Badge variant="secondary">v{ch.ModificationVersion}</Badge>}
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>No details found for {selectedCwe}.</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
