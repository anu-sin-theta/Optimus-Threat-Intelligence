"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Calendar, ExternalLink, Search, Filter, Download, RotateCw } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import { intelligentSearch } from "@/lib/search"
import { useDebounce } from "@/hooks/use-debounce"

const ITEMS_PER_PAGE = 50;

export default function CisaKevTab() {
  const [kevEntries, setKevEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDue, setFilterDue] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [timePeriod, setTimePeriod] = useState('all')
  const [totalItems, setTotalItems] = useState(0)
  const [stats, setStats] = useState({ total: 0, dueSoon: 0, addedThisMonth: 0 })
  const [isSearching, setIsSearching] = useState(false)
  const [selectedKevNvdData, setSelectedKevNvdData] = useState(null);
  const [isCweDialogOpen, setIsCweDialogOpen] = useState(false);
  const [selectedCwe, setSelectedCwe] = useState(null);
  const [cweDetails, setCweDetails] = useState(null);
  const [cweLoading, setCweLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const fetchKEVData = async (forceUpdate = false) => {
    try {
      setLoading(true)
      let url = `/api/cisa?page=${currentPage}&pageSize=${ITEMS_PER_PAGE}`;
      if (forceUpdate) {
        url += '&forceUpdate=true';
      }
      if (timePeriod !== 'all') {
        url += `&days=${timePeriod}`;
      }
      if (filterDue !== 'all') {
        url += `&due=${filterDue}`;
      }

      const response = await fetch(url)
      const data = await response.json()
      if (data.vulnerabilities) {
        // Add days until due calculation
        const formattedEntries = data.vulnerabilities.map(entry => ({
          ...entry,
          daysUntilDue: Math.ceil(
            (new Date(entry.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
          )
        }))
        setKevEntries(formattedEntries)
        setTotalItems(data.pagination.totalItems || 0);
        setStats(data.stats || { total: 0, dueSoon: 0, addedThisMonth: 0 });
      }
    } catch (error) {
      console.error("Error fetching KEV data:", error)
    } finally {
      setLoading(false)
      setUpdating(false)
    }
  }

  useEffect(() => {
    fetchKEVData()
  }, [currentPage, timePeriod, filterDue])

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery) {
        // If search is empty, fetch normal data
        fetchKEVData()
        return
      }

      setIsSearching(true)
      try {
        // Try to find in cache first
        const results = await intelligentSearch(debouncedSearchQuery, ['cisa'], false)
        const cisaResults = results.find(r => r.source === 'cisa')
        if (cisaResults?.data) {
          const formattedEntries = cisaResults.data.map(entry => ({
            ...entry,
            daysUntilDue: Math.ceil(
              (new Date(entry.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
            )
          }))
          setKevEntries(formattedEntries)
        } else {
          // If not found in cache, force update from API
          const updatedResults = await intelligentSearch(debouncedSearchQuery, ['cisa'], true)
          const updatedCisaResults = updatedResults.find(r => r.source === 'cisa')
          if (updatedCisaResults?.data) {
            const formattedEntries = updatedCisaResults.data.map(entry => ({
              ...entry,
              daysUntilDue: Math.ceil(
                (new Date(entry.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
              )
            }))
            setKevEntries(formattedEntries)
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

  const handleForceUpdate = async () => {
    setUpdating(true)
    await fetchKEVData(true)
  }

  const handleViewDetails = async (entry) => {
    setSelectedEntry(entry)
    setIsDetailsOpen(true)
    setSelectedKevNvdData(null); // Reset previous data
    try {
      const response = await fetch(`/api/nvd?cveId=${entry.cveID}`);
      const data = await response.json();
      if (response.ok) {
        setSelectedKevNvdData(data);
      }
    } catch (error) {
      console.error("Error fetching NVD data for KEV entry:", error);
    }
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

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <Card className="bg-destructive/20 border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-foreground mb-1">CISA Known Exploited Vulnerabilities</h3>
              <p className="text-sm text-muted-foreground">
                These vulnerabilities are actively exploited in the wild. Federal agencies must remediate by the due
                date.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                placeholder="Search vulnerabilities (e.g., Cisco, Windows, Apache)..."
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <Select
              value={filterDue}
              onValueChange={(value) => {
                setFilterDue(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by due date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Due Dates</SelectItem>
                <SelectItem value="urgent">Due within 7 days</SelectItem>
                <SelectItem value="upcoming">Due within 30 days</SelectItem>
                <SelectItem value="later">Due later</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={timePeriod}
              onValueChange={(value) => {
                setTimePeriod(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="1">Last 24 hours</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleForceUpdate}
              disabled={updating}
            >
              <RotateCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
              {updating ? 'Updating...' : 'Force Update'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total KEV Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Active vulnerabilities</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Due Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{stats.dueSoon}</p>
            <p className="text-xs text-muted-foreground mt-1">Due within 7 days</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Added This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-2">{stats.addedThisMonth}</p>
            <p className="text-xs text-muted-foreground mt-1">New entries</p>
          </CardContent>
        </Card>
      </div>

      {/* KEV Catalog */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Known Exploited Vulnerabilities Catalog</CardTitle>
          <CardDescription>
            {loading ? 'Loading entries...' :
              `Showing ${kevEntries.length} of ${totalItems} entries`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <RotateCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading entries...</span>
              </div>
            ) : kevEntries.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                No entries found matching your criteria
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {kevEntries.map((entry) => (
                    <div
                      key={entry.cveID}
                      className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="destructive">Known Exploited</Badge>
                            <span className="font-mono font-bold text-foreground">{entry.cveID}</span>
                            <Badge variant={entry.daysUntilDue <= 7 ? "destructive" : "outline"}>
                              Due in {entry.daysUntilDue} days
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground mb-1">{entry.vulnerabilityName}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>
                              Vendor: <span className="text-foreground">{entry.vendorProject}</span>
                            </span>
                            <span>
                              Product: <span className="text-foreground">{entry.product}</span>
                            </span>
                            <span>
                              Added: <span className="text-foreground">{entry.dateAdded}</span>
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(entry)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          />
                        </PaginationItem>

                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i + 1}>
                            <PaginationLink
                              onClick={() => handlePageChange(i + 1)}
                              isActive={currentPage === i + 1}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Badge variant="destructive">Known Exploited</Badge>
                  {selectedEntry.cveID}
                </DialogTitle>
                <DialogDescription>
                  Added: {selectedEntry.dateAdded} | Due: {selectedEntry.dueDate}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Vulnerability Details</h3>
                  <p className="text-muted-foreground">{selectedEntry.vulnerabilityName}</p>
                  <p className="text-sm text-muted-foreground mt-2">{selectedEntry.shortDescription}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Affected Product</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Vendor</p>
                      <p className="font-medium">{selectedEntry.vendorProject}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Product</p>
                      <p className="font-medium">{selectedEntry.product}</p>
                    </div>
                  </div>
                </div>

                {selectedKevNvdData?.cve?.weaknesses?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Weaknesses</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedKevNvdData.cve.weaknesses.map((weakness, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleCweClick(weakness.description?.[0]?.value)}
                        >
                          {weakness.description?.[0]?.value || 'N/A'}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-2">Required Action</h3>
                  <p className="text-muted-foreground">{selectedEntry.requiredAction}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Due by: <span className="font-medium text-foreground">{selectedEntry.dueDate}</span>
                      {selectedEntry.daysUntilDue <= 7 && (
                        <span className="ml-2 text-destructive">(Urgent: Due in {selectedEntry.daysUntilDue} days)</span>
                      )}
                    </span>
                  </div>
                </div>

                {selectedEntry.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Additional Notes</h3>
                    <p className="text-muted-foreground">{selectedEntry.notes}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-2">External Resources</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a
                        href={`https://nvd.nist.gov/vuln/detail/${selectedEntry.cveID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View on NVD
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a
                        href="https://www.cisa.gov/known-exploited-vulnerabilities-catalog"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        CISA KEV Catalog
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
