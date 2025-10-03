"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Filter, Download, RotateCw } from "lucide-react"
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

export default function RedHatTab() {
  const [advisories, setAdvisories] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedAdvisory, setSelectedAdvisory] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const fetchAdvisories = async (forceUpdate = false) => {
    try {
      setLoading(true);
      const nvdResponse = await fetch('/api/nvd?days=7&severity=CRITICAL,HIGH&limit=50');
      const nvdData = await nvdResponse.json();
      if (nvdData.vulnerabilities) {
        const cveIds = nvdData.vulnerabilities.map(vuln => vuln.cve.id).join(',');
        const url = forceUpdate ?
          `/api/redhat?forceUpdate=true&cveIds=${cveIds}` :
          `/api/redhat?cveIds=${cveIds}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.advisories) {
          setAdvisories(data.advisories);
          setTotalItems(data.advisories.length);
        }
      }
    } catch (error) {
      console.error("Error fetching advisories:", error);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchAdvisories()
  }, [])

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery) {
        // If search is empty, fetch normal data
        fetchAdvisories()
        return
      }

      setIsSearching(true)
      try {
        const results = await intelligentSearch(debouncedSearchQuery, ['redhat'], false)
        const redhatResults = results.find(r => r.source === 'redhat')
        if (redhatResults?.data) {
          setAdvisories(redhatResults.data)
        } else {
          // If not found in cache, force update from API
          const updatedResults = await intelligentSearch(debouncedSearchQuery, ['redhat'], true)
          const updatedRedhatResults = updatedResults.find(r => r.source === 'redhat')
          setAdvisories(updatedRedhatResults?.data || [])
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
    await fetchAdvisories(true)
  }

  const handleViewDetails = (advisory) => {
    setSelectedAdvisory(advisory)
    setIsDetailsOpen(true)
  }

  const filteredAdvisories = advisories.filter(advisory => {
    const matchesSearch = searchQuery.toLowerCase() === '' ||
      advisory.cve_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advisory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advisory.details.some(detail =>
        detail.toLowerCase().includes(searchQuery.toLowerCase())
      )

    const matchesSeverity = filterSeverity === 'all' ||
      advisory.severity.toLowerCase() === filterSeverity.toLowerCase() ||
      (advisory.nvdData?.severity || '').toLowerCase() === filterSeverity.toLowerCase()

    return matchesSearch && matchesSeverity
  })

  // Pagination
  const totalPages = Math.ceil(filteredAdvisories.length / ITEMS_PER_PAGE)
  const paginatedAdvisories = filteredAdvisories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

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
                placeholder="Search advisories (e.g., nodejs, apache, sql)..."
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <Select
              value={filterSeverity}
              onValueChange={(value) => {
                setFilterSeverity(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
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
            <p className="text-3xl font-bold text-destructive">
              {advisories.filter(a =>
                a.severity === 'CRITICAL' || a.nvdData?.severity === 'CRITICAL'
              ).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">High</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-5">
              {advisories.filter(a =>
                a.severity === 'HIGH' || a.nvdData?.severity === 'HIGH'
              ).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Medium</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-4">
              {advisories.filter(a =>
                a.severity === 'MEDIUM' || a.nvdData?.severity === 'MEDIUM'
              ).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-2">{totalItems}</p>
          </CardContent>
        </Card>
      </div>

      {/* Advisories List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Red Hat Security Advisories</CardTitle>
          <CardDescription>
            {loading ? 'Loading advisories...' :
              `Showing ${paginatedAdvisories.length} of ${filteredAdvisories.length} advisories`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <RotateCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading advisories...</span>
              </div>
            ) : paginatedAdvisories.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                No advisories found matching your criteria
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedAdvisories.map((advisory) => (
                    <div
                      key={advisory.id}
                      className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              variant={
                                (advisory.severity === "CRITICAL" || advisory.nvdData?.severity === "CRITICAL")
                                  ? "destructive"
                                  : (advisory.severity === "HIGH" || advisory.nvdData?.severity === "HIGH")
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {advisory.nvdData?.severity || advisory.severity}
                            </Badge>
                            <span className="font-mono font-bold text-foreground">{advisory.cve_id}</span>
                            {advisory.nvdData?.cvssScore && (
                              <span className="text-lg font-bold text-primary">
                                {advisory.nvdData.cvssScore}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground mb-1">
                            {advisory.nvdData?.description || advisory.title}
                          </p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>
                              Affected: <span className="text-foreground">
                                {advisory.affected_packages.join(", ")}
                              </span>
                            </span>
                            {advisory.nvdData?.publishedDate && (
                              <span>
                                Published: <span className="text-foreground">
                                  {new Date(advisory.nvdData.publishedDate).toLocaleDateString()}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(advisory)}>
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
          {selectedAdvisory && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Badge
                    variant={
                      (selectedAdvisory.severity === "CRITICAL" || selectedAdvisory.nvdData?.severity === "CRITICAL")
                        ? "destructive"
                        : (selectedAdvisory.severity === "HIGH" || selectedAdvisory.nvdData?.severity === "HIGH")
                          ? "default"
                          : "secondary"
                    }
                  >
                    {selectedAdvisory.nvdData?.severity || selectedAdvisory.severity}
                  </Badge>
                  {selectedAdvisory.cve_id}
                  {selectedAdvisory.nvdData?.cvssScore && (
                    <span className="text-lg font-bold text-primary">
                      {selectedAdvisory.nvdData.cvssScore}
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {selectedAdvisory.nvdData?.publishedDate && (
                    <>Published: {new Date(selectedAdvisory.nvdData.publishedDate).toLocaleString()}</>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {selectedAdvisory.nvdData?.description || selectedAdvisory.title}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Affected Products</h3>
                  <div className="space-y-2">
                    {selectedAdvisory.affected_packages.map((pkg, idx) => (
                      <div key={idx} className="text-muted-foreground">
                        {pkg}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedAdvisory.details && selectedAdvisory.details.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Red Hat Analysis</h3>
                    <div className="space-y-2">
                      {selectedAdvisory.details.map((detail, idx) => (
                        <p key={idx} className="text-muted-foreground">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAdvisory.nvdData?.references && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">References</h3>
                    <div className="space-y-2">
                      {selectedAdvisory.nvdData.references.map((ref, idx) => (
                        <div key={idx}>
                          <a
                            href={ref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {ref}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-2">Additional Resources</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a
                        href={selectedAdvisory.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Red Hat Portal
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a
                        href={`https://nvd.nist.gov/vuln/detail/${selectedAdvisory.cve_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on NVD
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
