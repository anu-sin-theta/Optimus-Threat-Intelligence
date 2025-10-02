"use client"

import { useState, useEffect } from "react"
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
import { Search, Filter, Download, RotateCw } from "lucide-react"
import { intelligentSearch } from "@/lib/search"
import { useDebounce } from "@/hooks/use-debounce"

export default function VulnerabilitiesTab() {
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

            return {
              id: vuln.cve.id || `vuln-${index}`, // Ensure unique ID
              description,
              severity: cvssData?.baseSeverity || 'UNKNOWN',
              score: cvssData?.baseScore || 0,
              vector: cvssData?.vectorString || '',
              vendor,
              product,
              published: vuln.cve.published ? new Date(vuln.cve.published).toLocaleDateString() : 'Unknown',
              modified: vuln.cve.lastModified ? new Date(vuln.cve.lastModified).toLocaleDateString() : 'Unknown',
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
    setSelectedVuln(vuln)
    setIsDetailsOpen(true)
  }

  const handleCweClick = async (cweId) => {
    setSelectedCwe(cweId);
    setIsCweDialogOpen(true);
    setCweLoading(true);
    try {
      const response = await fetch(`/api/cwe/${cweId}`);
      const data = await response.json();
      if (response.ok) {
        setCweDetails(data.Weaknesses[0]);
      } else {
        throw new Error(data.error || 'Failed to fetch CWE details');
      }
    } catch (error) {
      console.error("Error fetching CWE details:", error);
      setCweDetails({ name: 'Error', description: error.message });
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

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedVuln && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Badge
                    variant={
                      selectedVuln.severity === "CRITICAL"
                        ? "destructive"
                        : selectedVuln.severity === "HIGH"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedVuln.severity}
                  </Badge>
                  {selectedVuln.id}
                  <span className="text-lg font-bold text-primary">{selectedVuln.score}</span>
                </DialogTitle>
                <DialogDescription>
                  Published: {selectedVuln.published} | Last Modified: {selectedVuln.modified}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedVuln.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Affected Product</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Vendor</p>
                      <p className="font-medium">{selectedVuln.vendor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Product</p>
                      <p className="font-medium">{selectedVuln.product}</p>
                    </div>
                  </div>
                </div>

                {/* CVSS Metrics */}
                {selectedVuln.metrics?.cvssMetricV31 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">CVSS Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {selectedVuln.metrics.cvssMetricV31.map((metric, idx) => (
                        <div key={idx} className="space-y-2">
                          <div>
                            <p className="text-muted-foreground">Attack Vector</p>
                            <p className="font-medium">{metric.cvssData.attackVector}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Attack Complexity</p>
                            <p className="font-medium">{metric.cvssData.attackComplexity}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Privileges Required</p>
                            <p className="font-medium">{metric.cvssData.privilegesRequired}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">User Interaction</p>
                            <p className="font-medium">{metric.cvssData.userInteraction}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Scope</p>
                            <p className="font-medium">{metric.cvssData.scope}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Vector</p>
                      <p className="font-mono text-xs bg-muted p-2 rounded-md">
                        {selectedVuln.metrics.cvssMetricV31[0].cvssData.vectorString}
                      </p>
                    </div>
                  </div>
                )}


                {selectedVuln.weaknesses.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Weaknesses</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedVuln.weaknesses.map((weakness, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleCweClick(weakness.description?.[0]?.value)}
                        >
                          {weakness.description?.[0]?.value || weakness}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedVuln.references.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">References</h3>
                    <div className="space-y-2">
                      {selectedVuln.references.map((ref, idx) => (
                        <div key={idx}>
                          <a
                            href={ref.url || ref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {ref.url || ref}
                          </a>
                          {ref.tags && (
                            <div className="flex gap-2 mt-1">
                              {ref.tags.map((tag, tagIdx) => (
                                <Badge key={tagIdx} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>CWE Details: {selectedCwe}</DialogTitle>
            <DialogDescription>
              A detailed description of the Common Weakness Enumeration.
            </DialogDescription>
          </DialogHeader>
          {cweLoading ? (
            <div className="flex items-center justify-center p-8">
              <RotateCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading CWE details...</span>
            </div>
          ) : cweDetails ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{cweDetails.Name}</h3>
                <p className="text-muted-foreground mt-1">{cweDetails.Description}</p>
              </div>
              {cweDetails.ExtendedDescription && (
                <div>
                  <h4 className="font-semibold">Extended Description</h4>
                  <p className="text-muted-foreground mt-1">{cweDetails.ExtendedDescription}</p>
                </div>
              )}
            </div>
          ) : (
            <p>No details found for {selectedCwe}.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
