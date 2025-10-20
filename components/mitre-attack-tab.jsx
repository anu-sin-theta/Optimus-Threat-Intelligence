"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Download, RotateCw, BookOpen, Shield, Database, Link } from "lucide-react"
import { intelligentSearch } from "@/lib/search"
import { useDebounce } from "@/hooks/use-debounce"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 50;

export default function MitreAttackTab() {
  const [attackData, setAttackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchAttackData = async (forceUpdate = false) => {
    try {
      setLoading(true);
      const url = forceUpdate ?
        '/api/mitre?forceUpdate=true' :
        '/api/mitre';
      const response = await fetch(url);
      const data = await response.json();
      setAttackData(data.techniques || []);
    } catch (error) {
      console.error("Error fetching MITRE ATT&CK data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttackData();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery) {
        fetchAttackData();
        return;
      }

      setIsSearching(true);
      try {
        const results = await intelligentSearch(debouncedSearchQuery, ['mitre'], false);
        const mitreResults = results.find(r => r.source === 'mitre');
        if (mitreResults?.data) {
          setAttackData(mitreResults.data);
        } else {
          const updatedResults = await intelligentSearch(debouncedSearchQuery, ['mitre'], true);
          const updatedMitreResults = updatedResults.find(r => r.source === 'mitre');
          setAttackData(updatedMitreResults?.data || []);
        }
      } catch (error) {
        console.error('Error performing search:', error);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  const handleViewDetails = (technique) => {
    setSelectedTechnique(technique);
    setIsDetailsOpen(true);
  };

  const totalPages = Math.ceil(attackData.length / ITEMS_PER_PAGE);
  const paginatedData = attackData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                isSearching ? 'animate-spin text-primary' : 'text-muted-foreground'
              }`} />
              <Input
                type="search"
                placeholder="Search MITRE ATT&CK techniques, tactics, or platforms..."
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fetchAttackData(true)}
              disabled={loading}
            >
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Updating...' : 'Force Update'}
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Techniques</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{attackData.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Unique Tactics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-5">
              {new Set(attackData.map(t => t.tactic)).size}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-4">
              {new Set(attackData.flatMap(t => t.platforms || [])).size}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Techniques Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <RotateCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading ATT&CK data...</span>
        </div>
      ) : attackData.length === 0 ? (
        <div className="text-center text-muted-foreground p-8">
          No techniques found matching your search criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedData.map((technique) => (
            <Card
              key={technique.id}
              className="bg-card border-border hover:bg-secondary/50 transition-colors cursor-pointer"
              onClick={() => handleViewDetails(technique)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge>{technique.tactic}</Badge>
                  <span className="text-sm text-muted-foreground">{technique.id.split('-')[0]}</span>
                </div>
                <CardTitle className="text-lg">{technique.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{technique.description}</p>
                {technique.platforms && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {technique.platforms.map((platform) => (
                      <Badge key={platform} variant="outline">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="w-[95%] sm:max-w-[100rem] max-h-[90vh] overflow-y-auto p-8">
          {selectedTechnique && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-2 pr-10">
                  <Badge variant="secondary" className="text-base">{selectedTechnique.tactic}</Badge>
                  <span className="text-sm font-mono bg-muted text-muted-foreground px-2 py-1 rounded">
                    {selectedTechnique.id.split('-')[0]}
                  </span>
                </div>
                <DialogTitle className="text-3xl font-bold text-foreground">{selectedTechnique.name}</DialogTitle>
                <DialogDescription className="text-md text-muted-foreground pt-1">
                  MITRE ATT&CK® Technique Details
                </DialogDescription>
              </DialogHeader>

              <Accordion type="multiple" defaultValue={['description', 'detection']} className="w-full space-y-2 pt-4">
                <AccordionItem value="description">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline bg-muted/50 px-4 rounded-md">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span>Description</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-4 text-base text-muted-foreground">
                    <p className="whitespace-pre-wrap">{selectedTechnique.description}</p>
                  </AccordionContent>
                </AccordionItem>

                {selectedTechnique.detectionName && (
                  <AccordionItem value="detection">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline bg-muted/50 px-4 rounded-md">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span>Detection</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-4 text-base text-muted-foreground">
                       <p className="whitespace-pre-wrap">{selectedTechnique.detectionName}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                <AccordionItem value="details">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline bg-muted/50 px-4 rounded-md">
                     <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        <span>Additional Details</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {selectedTechnique.platforms && (
                        <div>
                          <h3 className="text-md font-semibold mb-3 text-foreground">Supported Platforms</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedTechnique.platforms.map((platform) => (
                              <Badge key={platform} variant="outline" className="text-base">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedTechnique.dataSources && (
                        <div>
                          <h3 className="text-md font-semibold mb-3 text-foreground">Data Sources</h3>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedTechnique.dataSources.map((source, idx) => (
                              <li key={idx} className="text-muted-foreground">
                                {source}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="pt-6 flex justify-end">
                <Button asChild variant="outline">
                  <a
                    href={`https://attack.mitre.org/techniques/${selectedTechnique.id.split('-')[0].replace('.', '/')}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <Link className="h-4 w-4" />
                    View on MITRE ATT&CK
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
