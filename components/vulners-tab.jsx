"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Search, RotateCw } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function VulnersTab() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchMode, setSearchMode] = useState("search")
  

  const performSearch = async () => {
    if (!searchQuery) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const VULNERS_API_URL = process.env.NEXT_PUBLIC_VULNERS_API_URL;
      let url;
      const params = new URLSearchParams();
      switch (searchMode) {
        case 'search':
          params.append('q', searchQuery);
          url = `${VULNERS_API_URL}/search?${params.toString()}`;
          break;
        case 'id':
          url = `${VULNERS_API_URL}/id/${searchQuery}`;
          break;
        case 'references':
          url = `${VULNERS_API_URL}/references/${searchQuery}`;
          break;
        case 'exploits-cve':
          url = `${VULNERS_API_URL}/exploits/cve/${searchQuery}`;
          break;
        default:
          console.error('Unknown search mode:', searchMode);
          return;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      let resultsArray = [];
      if (data.data && data.data.search) {
        resultsArray = Object.values(data.data.search);
      } else if (data.data && data.data.documents) {
        resultsArray = data.data.documents;
      } else if (Array.isArray(data)) {
        resultsArray = data;
      } else if (typeof data === 'object' && data !== null) {
        resultsArray = [data];
      }
      
      setResults(resultsArray);
    } catch (error) {
      console.error('Error performing search:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-60 mt-8">
      <div className="flex justify-center">
        <Card className="bg-card border-border w-full max-w-3xl">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Select value={searchMode} onValueChange={setSearchMode}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select search mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="search">Search</SelectItem>
                  <SelectItem value="id">Get by ID</SelectItem>
                  <SelectItem value="references">Get References</SelectItem>
                  <SelectItem value="exploits-cve">Get Exploits for CVE</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                  isSearching ? 'animate-spin text-primary' : 'text-muted-foreground'
                }`} />
                <Input
                  type="search"
                  placeholder="Search Vulners..."
                  className="pl-9 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') performSearch(); }}
                />
              </div>
              <Button onClick={performSearch} disabled={isSearching}>
                {isSearching ? <RotateCw className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <RotateCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      ) : results.length === 0 ? (
        searchQuery ? (
          <div className="text-center text-muted-foreground p-8">
            No results found for "{searchQuery}".
          </div>
        ) : (
          <div className="text-center p-8 border-2 border-dashed rounded-lg mt-8 max-w-2xl mx-auto bg-orange-50 border-orange-300 text-orange-800">
            <h2 className="text-xl font-semibold mb-2 text-orange-900">How to Use Vulners Search</h2>
            <p className="mb-4">Select a search mode from the dropdown and enter your query to begin.</p>
            <ul className="text-left max-w-md mx-auto list-disc list-inside space-y-1">
              <li><span className="font-semibold text-orange-900">Search:</span> Performs a broad keyword search across the Vulners database.</li>
              <li><span className="font-semibold text-orange-900">Get by ID:</span> Retrieves a specific bulletin by its unique Vulners ID.</li>
              <li><span className="font-semibold text-orange-900">Get References:</span> Finds related references for a specific bulletin ID.</li>
              <li><span className="font-semibold text-orange-900">Get Exploits for CVE:</span> Searches for known public exploits for a given CVE identifier.</li>
            </ul>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.id ?? result._id} className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">{result.title}</CardTitle>
                <div className="flex flex-wrap gap-2 pt-2">
                  {result.bulletinFamily && <Badge>{result.bulletinFamily}</Badge>}
                  {result.type && <Badge variant="secondary">{result.type}</Badge>}
                  {result.cvss?.severity && <Badge variant="destructive">{result.cvss.severity}</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {result.cvss3?.cvssV31 && <TabsTrigger value="cvss">CVSS Details</TabsTrigger>}
                    {result.sourceData && <TabsTrigger value="source">Source</TabsTrigger>}
                    <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-4">
                    <p className="text-sm text-muted-foreground mb-4">{result.description}</p>
                    <Table>
                      <TableBody>
                        {result.cvelist?.length > 0 && (
                          <TableRow>
                            <TableCell className="font-medium">CVEs</TableCell>
                            <TableCell>{result.cvelist.join(', ')}</TableCell>
                          </TableRow>
                        )}
                        {result.cvss?.score && (
                          <TableRow>
                            <TableCell className="font-medium">CVSS Score</TableCell>
                            <TableCell>{result.cvss.score} ({result.cvss.severity})</TableCell>
                          </TableRow>
                        )}
                        {result.cvss?.vector && (
                          <TableRow>
                            <TableCell className="font-medium">CVSS Vector</TableCell>
                            <TableCell>{result.cvss.vector}</TableCell>
                          </TableRow>
                        )}
                        {result.published && (
                          <TableRow>
                            <TableCell className="font-medium">Published</TableCell>
                            <TableCell>{new Date(result.published).toLocaleDateString()}</TableCell>
                          </TableRow>
                        )}
                        {result.modified && (
                          <TableRow>
                            <TableCell className="font-medium">Modified</TableCell>
                            <TableCell>{new Date(result.modified).toLocaleDateString()}</TableCell>
                          </TableRow>
                        )}
                        {result.href && (
                          <TableRow>
                            <TableCell className="font-medium">Link</TableCell>
                            <TableCell><a href={result.href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{result.href}</a></TableCell>
                          </TableRow>
                        )}
                        {result.vhref && (
                          <TableRow>
                            <TableCell className="font-medium">Vulners Link</TableCell>
                            <TableCell><a href={result.vhref} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{result.vhref}</a></TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  {result.cvss3?.cvssV31 && (
                    <TabsContent value="cvss" className="mt-4">
                      <Table>
                        <TableBody>
                          {Object.entries(result.cvss3.cvssV31).map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</TableCell>
                              <TableCell>{String(value)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  )}
                  {result.sourceData && (
                    <TabsContent value="source" className="mt-4">
                      <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-md">{result.sourceData}</pre>
                    </TabsContent>
                  )}
                  <TabsContent value="raw" className="mt-4">
                    <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-md">{JSON.stringify(result, null, 2)}</pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
