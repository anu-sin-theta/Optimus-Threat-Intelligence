import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, RotateCw, HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const OptiAbusedTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tag, setTag] = useState("");
  const [malware, setMalware] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [filterTerm, setFilterTerm] = useState("");
  const itemsPerPage = 10;

  const toggleRowExpansion = (id) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const makeApiCall = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setCurrentPage(1);
    setFilterTerm("");

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An unknown error occurred.");
        return;
      }

      setResults(data);
    } catch (err) {
      console.error("Error making API call:", err);
      setError("Failed to connect to the API.");
    } finally {
      setLoading(false);
    }
  }, []);

  const renderResults = () => {
    if (!results) return null;

    const isMalwareList = (data) => {
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            return false;
        }
        const firstKey = Object.keys(data)[0];
        if (!firstKey) return true; // It can be an empty object
        const firstValue = data[firstKey];
        return typeof firstValue === 'object' && firstValue !== null && 'malware_printable' in firstValue;
    };

    const isTagList = (data) => {
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            return false;
        }
        const firstKey = Object.keys(data)[0];
        if (!firstKey) return true; // It can be an empty object
        const firstValue = data[firstKey];
        return typeof firstValue === 'object' && firstValue !== null && 'first_seen' in firstValue && 'color' in firstValue;
    };

    if (results.query_status === 'ok' && Array.isArray(results.data)) {
      const filteredData = results.data.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(filterTerm.toLowerCase())
        )
      );

      const totalPages = Math.ceil(filteredData.length / itemsPerPage);
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

      const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
      };

      return (
        <Card className="bg-card border-border w-full mt-4">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Results</CardTitle>
                    <CardDescription>{filteredData.length} results found</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search results..."
                        value={filterTerm}
                        onChange={(e) => setFilterTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <Button variant="ghost" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                    <PaginationPrevious />
                                </Button>
                            </PaginationItem>
                            {[...Array(totalPages).keys()].slice(0, 5).map((page) => (
                            <PaginationItem key={page + 1}>
                                <PaginationLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(page + 1);
                                }}
                                isActive={currentPage === page + 1}
                                >
                                {page + 1}
                                </PaginationLink>
                            </PaginationItem>
                            ))}
                            {totalPages > 5 && <PaginationEllipsis />}
                            <PaginationItem>
                                <Button variant="ghost" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                    <PaginationNext />
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead>IOC</TableHead>
                  <TableHead>Threat Type</TableHead>
                  <TableHead>Malware</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>First Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((ioc) => {
                  console.log(ioc);
                  const isExpanded = expandedRows.has(ioc.id);
                  return (
                    <React.Fragment key={ioc.id}>
                      <TableRow>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => toggleRowExpansion(ioc.id)}>
                            {isExpanded ? <ChevronDown /> : <ChevronRight />}
                          </Button>
                        </TableCell>
                        <TableCell>{ioc.ioc}</TableCell>
                        <TableCell>{ioc.threat_type_desc}</TableCell>
                        <TableCell>{ioc.malware_printable}</TableCell>
                        <TableCell>{ioc.confidence_level}</TableCell>
                        <TableCell>{new Date(ioc.first_seen).toLocaleString()}</TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <div className="p-4 bg-muted rounded-md">
                              <h4 className="font-semibold">Additional Information</h4>
                              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                                <div className="flex flex-col">
                                  <dt className="font-medium">IOC Type</dt>
                                  <dd>{ioc.ioc_type_desc}</dd>
                                </div>
                                <div className="flex flex-col">
                                  <dt className="font-medium">Reporter</dt>
                                  <dd>{ioc.reporter}</dd>
                                </div>
                                {ioc.last_seen && (
                                  <div className="flex flex-col">
                                    <dt className="font-medium">Last Seen</dt>
                                    <dd>{new Date(ioc.last_seen).toLocaleString()}</dd>
                                  </div>
                                )}
                                {ioc.malware_alias && (
                                  <div className="flex flex-col">
                                    <dt className="font-medium">Malware Alias</dt>
                                    <dd>{ioc.malware_alias}</dd>
                                  </div>
                                )}
                                {ioc.malware_malpedia && (
                                  <div className="flex flex-col">
                                    <dt className="font-medium">Malpedia</dt>
                                    <dd><a href={ioc.malware_malpedia} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{ioc.malware_malpedia}</a></dd>
                                  </div>
                                )}
                                {ioc.reference && (
                                  <div className="flex flex-col">
                                    <dt className="font-medium">Reference</dt>
                                    <dd><a href={ioc.reference} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{ioc.reference}</a></dd>
                                  </div>
                                )}
                                {ioc.tags && ioc.tags.length > 0 && (
                                  <div className="flex flex-col">
                                    <dt className="font-medium">Tags</dt>
                                    <dd>{ioc.tags.join(', ')}</dd>
                                  </div>
                                )}
                              </dl>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    } else if (results.query_status === 'ok' && isMalwareList(results.data)) {
      console.log(results.data);
      const filteredData = Object.entries(results.data).filter(([key, value]) =>
        key.toLowerCase().includes(filterTerm.toLowerCase()) ||
        value.malware_printable.toLowerCase().includes(filterTerm.toLowerCase()) ||
        (value.malware_alias && value.malware_alias.toLowerCase().includes(filterTerm.toLowerCase()))
      );

      const totalPages = Math.ceil(filteredData.length / itemsPerPage);
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

      const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
      };

      return (
        <Card className="bg-card border-border w-full mt-4">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Malware List</CardTitle>
                    <CardDescription>{filteredData.length} malware found</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search results..."
                        value={filterTerm}
                        onChange={(e) => setFilterTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <Button variant="ghost" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                    <PaginationPrevious />
                                </Button>
                            </PaginationItem>
                            {[...Array(totalPages).keys()].slice(0, 5).map((page) => (
                            <PaginationItem key={page + 1}>
                                <PaginationLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(page + 1);
                                }}
                                isActive={currentPage === page + 1}
                                >
                                {page + 1}
                                </PaginationLink>
                            </PaginationItem>
                            ))}
                            {totalPages > 5 && <PaginationEllipsis />}
                            <PaginationItem>
                                <Button variant="ghost" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                    <PaginationNext />
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identifier</TableHead>
                  <TableHead>Printable Name</TableHead>
                  <TableHead>Aliases</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>{value.malware_printable}</TableCell>
                    <TableCell>{value.malware_alias || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    } else if (results.query_status === 'ok' && isTagList(results.data)) {
        console.log(results.data);
        const filteredData = Object.entries(results.data).filter(([key, value]) =>
            key.toLowerCase().includes(filterTerm.toLowerCase())
        );

        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

        const handlePageChange = (page) => {
            if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            }
        };

        return (
            <Card className="bg-card border-border w-full mt-4">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Tag List</CardTitle>
                        <CardDescription>{filteredData.length} tags found</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Search results..."
                            value={filterTerm}
                            onChange={(e) => setFilterTerm(e.target.value)}
                            className="max-w-sm"
                        />
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <Button variant="ghost" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                        <PaginationPrevious />
                                    </Button>
                                </PaginationItem>
                                {[...Array(totalPages).keys()].slice(0, 5).map((page) => (
                                <PaginationItem key={page + 1}>
                                    <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(page + 1);
                                    }}
                                    isActive={currentPage === page + 1}
                                    >
                                    {page + 1}
                                    </PaginationLink>
                                </PaginationItem>
                                ))}
                                {totalPages > 5 && <PaginationEllipsis />}
                                <PaginationItem>
                                    <Button variant="ghost" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                        <PaginationNext />
                                    </Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Tag</TableHead>
                    <TableHead>First Seen</TableHead>
                    <TableHead>Color</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentItems.map(([key, value]) => (
                    <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>{new Date(value.first_seen).toLocaleString()}</TableCell>
                        <TableCell>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: value.color }} />
                            {value.color}
                        </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
        );
    } else if (results.data) {
        return (
            <Card className="bg-card border-border w-full mt-4">
                <CardHeader>
                    <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-md">{JSON.stringify(results.data, null, 2)}</pre>
                </CardContent>
            </Card>
        )
    }

    return <div className="text-center text-muted-foreground p-4">No results found.</div>;
  };

  const handleTagSearch = () => makeApiCall(`/api/threatfox/taginfo/${tag}`);
  const handleMalwareSearch = () => makeApiCall(`/api/threatfox/malwareinfo/${malware}`);
  const handleMalwareList = () => makeApiCall('/api/threatfox/malware_list');
  const handleTagList = () => makeApiCall('/api/threatfox/tag_list');

  const handleRecentIOCs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/threatfox/iocs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days: 1 }),
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to fetch recent IOCs');
    }
    setLoading(false);
  };

  return (
    <Tabs defaultValue="search" className="w-full">
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="search">Search IOC</TabsTrigger>
          <TabsTrigger value="ioc">IOC by ID</TabsTrigger>
          <TabsTrigger value="hash">Search by Hash</TabsTrigger>
          <TabsTrigger value="tag">Query by Tag</TabsTrigger>
          <TabsTrigger value="malware">Query by Malware</TabsTrigger>
          <TabsTrigger value="lists">Lists</TabsTrigger>
          <TabsTrigger value="recent">Recent IOCs</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <Card className="bg-card border-border w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Search IOC</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Search IOC</DialogTitle>
                      <DialogDescription>
                        Search for Indicators of Compromise (IOCs) like IP addresses, domains, URLs, or hashes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <p className="font-semibold">Examples:</p>
                      <ul className="list-disc list-inside mt-2">
                        <li>1.1.1.1</li>
                        <li>google.com</li>
                      </ul>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Search for IOCs (e.g., 1.1.1.1, google.com, etc.)"
                  className="bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') makeApiCall(`/api/threatfox/search?ioc=${searchTerm}`); }}
                />
                <Button onClick={() => makeApiCall(`/api/threatfox/search?ioc=${searchTerm}`)} disabled={loading}>
                  {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ioc">
          <Card className="bg-card border-border w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>IOC by ID</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>IOC by ID</DialogTitle>
                      <DialogDescription>
                        Retrieve a specific IOC by its ThreatFox ID.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <p className="font-semibold">Examples:</p>
                      <ul className="list-disc list-inside mt-2">
                        <li>12345</li>
                        <li>67890</li>
                      </ul>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter IOC ID"
                  className="bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') makeApiCall(`/api/threatfox/ioc/${searchTerm}`); }}
                />
                <Button onClick={() => makeApiCall(`/api/threatfox/ioc/${searchTerm}`)} disabled={loading}>
                  {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : "Get IOC"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hash">
          <Card className="bg-card border-border w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Search by Hash</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Search by Hash</DialogTitle>
                      <DialogDescription>
                        Search for a malware hash (MD5 or SHA256).
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <p className="font-semibold">Examples:</p>
                      <ul className="list-disc list-inside mt-2">
                        <li>d41d8cd98f00b204e9800998ecf8427e</li>
                        <li>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</li>
                      </ul>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter Hash (MD5 or SHA256)"
                  className="bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') makeApiCall(`/api/threatfox/search_hash/${searchTerm}`); }}
                />
                <Button onClick={() => makeApiCall(`/api/threatfox/search_hash/${searchTerm}`)} disabled={loading}>
                  {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : "Search Hash"}
                </Button>
              </div>
            </CardContent>
          </Card>
      </TabsContent>

      <TabsContent value="tag">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Query by Tag</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Query by Tag</DialogTitle>
                    <DialogDescription>
                      Search for IOCs associated with a specific tag. Tags can represent malware families, threat actors, or campaigns.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                    <p className="font-semibold">Examples:</p>
                    <ul className="list-disc list-inside mt-2">
                      <li>APT28</li>
                      <li>TrickBot</li>
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>Search for IOCs by tag (e.g., APT28, TrickBot).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Enter tag"
              />
              <Button onClick={handleTagSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="malware">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Query by Malware</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Query by Malware</DialogTitle>
                    <DialogDescription>
                      Search for IOCs associated with a specific malware.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                    <p className="font-semibold">Examples:</p>
                    <ul className="list-disc list-inside mt-2">
                      <li>Emotet</li>
                      <li>Cobalt Strike</li>
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>Search for IOCs by malware (e.g., Emotet, Cobalt Strike).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                value={malware}
                onChange={(e) => setMalware(e.target.value)}
                placeholder="Enter malware"
              />
              <Button onClick={handleMalwareSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="lists">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Get Lists</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Get Lists</DialogTitle>
                    <DialogDescription>
                      Get lists of all known malware and tags from ThreatFox.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>Get lists of all known malware and tags.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={handleMalwareList}>Get Malware List</Button>
              <Button onClick={handleTagList}>Get Tag List</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="recent">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent IOCs</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Recent IOCs</DialogTitle>
                    <DialogDescription>
                      Get a list of IOCs that have been added to ThreatFox in the last 24 hours.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>Get recent IOCs from the last 24 hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRecentIOCs}>Get Recent IOCs</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="mt-4">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && !results && (
          <div className="text-center p-8 border-2 border-dashed rounded-lg mt-8 max-w-2xl mx-auto bg-blue-50 border-blue-300 text-blue-800">
            <h2 className="text-xl font-semibold mb-2 text-blue-900">Welcome to ThreatFox</h2>
            <p className="mb-4">ThreatFox is a free platform from abuse.ch with the goal of sharing indicators of compromise (IOCs) associated with malware.</p>
            <p className="mb-4">Select a tab above to start searching for IOCs.</p>
          </div>
        )}
        {results && renderResults()}
      </div>
    </Tabs>
  );
}

export default OptiAbusedTab;