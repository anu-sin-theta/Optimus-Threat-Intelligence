import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, RotateCw } from "lucide-react";

const OptiAbusedTab = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeApiCall = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    setResults(null);

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

    if (results.query_status === 'ok' && Array.isArray(results.data)) {
      return (
        <Card className="bg-card border-border w-full mt-4">
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>{results.data.length} results found</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IOC</TableHead>
                  <TableHead>Threat Type</TableHead>
                  <TableHead>Malware</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>First Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.data.map((ioc) => (
                  <TableRow key={ioc.id}>
                    <TableCell>{ioc.ioc}</TableCell>
                    <TableCell>{ioc.threat_type_desc}</TableCell>
                    <TableCell>{ioc.malware_printable}</TableCell>
                    <TableCell>{ioc.confidence_level}</TableCell>
                    <TableCell>{new Date(ioc.first_seen).toLocaleString()}</TableCell>
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
                <CardContent>
                    <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-md">{JSON.stringify(results.data, null, 2)}</pre>
                </CardContent>
            </Card>
        )
    }

    return <div className="text-center text-muted-foreground p-4">No results found.</div>;
  };

  return (
    <div className="space-y-6 mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="search">Search IOC</TabsTrigger>
          <TabsTrigger value="ioc">IOC by ID</TabsTrigger>
          <TabsTrigger value="hash">Search by Hash</TabsTrigger>
          <TabsTrigger value="tag">Query by Tag</TabsTrigger>
          <TabsTrigger value="malware">Query by Malware</TabsTrigger>
          <TabsTrigger value="lists">Lists</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <Card className="bg-card border-border w-full">
            <CardContent className="pt-6">
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
            <CardContent className="pt-6">
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
            <CardContent className="pt-6">
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
          <Card className="bg-card border-border w-full">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter Tag"
                  className="bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') makeApiCall(`/api/threatfox/taginfo/${searchTerm}`); }}
                />
                <Button onClick={() => makeApiCall(`/api/threatfox/taginfo/${searchTerm}`)} disabled={loading}>
                  {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : "Query Tag"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="malware">
          <Card className="bg-card border-border w-full">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter Malware"
                  className="bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') makeApiCall(`/api/threatfox/malwareinfo/${searchTerm}`); }}
                />
                <Button onClick={() => makeApiCall(`/api/threatfox/malwareinfo/${searchTerm}`)} disabled={loading}>
                  {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : "Query Malware"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lists">
            <Card className="bg-card border-border w-full">
                <CardHeader>
                    <CardTitle>Available Lists</CardTitle>
                    <CardDescription>Fetch various lists from ThreatFox.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button onClick={() => makeApiCall('/api/threatfox/malware_list')} disabled={loading}>
                        {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : "Get Malware List"}
                    </Button>
                    <Button onClick={() => makeApiCall('/api/threatfox/types')} disabled={loading}>
                        {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : "Get IOC Types"}
                    </Button>
                    <Button onClick={() => makeApiCall('/api/threatfox/tag_list')} disabled={loading}>
                        {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : "Get Tag List"}
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      {error && (
          <div className="text-center text-red-500 p-4">
            Error: {error}
          </div>
      )}

      {renderResults()}

    </div>
  );
};

export default OptiAbusedTab;