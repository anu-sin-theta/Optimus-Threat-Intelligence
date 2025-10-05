import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, RotateCw } from "lucide-react";

const MaliciousIpsTab = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [blacklist, setBlacklist] = useState([]);
  const [loadingBlacklist, setLoadingBlacklist] = useState(false);
  const [blacklistError, setBlacklistError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayReportLimit, setDisplayReportLimit] = useState(null); // New state for dynamic report limit

  const fetchBlacklist = useCallback(async (forceRefresh = false) => {
    setLoadingBlacklist(true);
    setBlacklistError(null);
    try {
      const url = forceRefresh ? '/api/abuseipdb/blacklist?forceRefresh=true' : '/api/abuseipdb/blacklist';
      const response = await fetch(url);
      const data = await response.json();
  
        if (!response.ok) {
          setBlacklistError(data.error || "Failed to fetch blacklist.");
          return;
        }
        setBlacklist(data.data);
      } catch (err) {
        console.error("Error fetching blacklist:", err);
        setBlacklistError("Failed to load blacklist.");
    } finally {
      setLoadingBlacklist(false);
    }
  }, []);

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  const filteredBlacklist = blacklist.filter(item =>
      item.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkIp = useCallback(async (ipToCheck = ipAddress) => {
    if (!ipToCheck) {
      setError("Please enter an IP address.");
      setResults(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`/api/abuseipdb?ip=${ipToCheck}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An unknown error occurred.");
        return;
      }

      setResults(data.data);
    } catch (err) {
      console.error("Error checking IP:", err);
      setError("Failed to connect to the API.");
    } finally {
      setLoading(false);
      // Reset displayReportLimit if it was set by a blacklist click and this is a new manual check
      if (ipToCheck === ipAddress && displayReportLimit !== null) {
        setDisplayReportLimit(null);
      }
    }
  }, [ipAddress, displayReportLimit, setError, setResults, setLoading, setDisplayReportLimit]);

  const handleBlacklistIpClick = useCallback(async (ip) => {
    setIpAddress(ip);
    setDisplayReportLimit(2); // Set limit to 2 for blacklist clicks
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await checkIp(ip); // Pass the IP directly to checkIp
  }, [setIpAddress, setDisplayReportLimit, checkIp]);

  const getConfidenceColor = (score) => {
    if (score >= 90) return "bg-red-500";
    if (score >= 70) return "bg-orange-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
      <div className="space-y-6 mt-8">
        <div>
          <Card className="bg-card border-border w-full">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                      loading ? 'animate-spin text-primary' : 'text-muted-foreground'
                  }`} />
                  <Input
                      type="text"
                      placeholder="Enter IP address (e.g., 1.1.1.1 or 2001:db8::1)"
                      className="pl-9 bg-background"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') checkIp(); }}
                  />
                </div>
                <Button onClick={checkIp} disabled={loading}>
                  {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : "Check IP"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
            <div className="text-center text-red-500 p-4">
              Error: {error}
            </div>
        )}

        {results ? (
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">IP Address: {results.ipAddress}</CardTitle>
                  <CardDescription>Abuse Confidence Score: {results.abuseConfidenceScore}%</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={results.abuseConfidenceScore} className="w-full" indicatorColor={getConfidenceColor(results.abuseConfidenceScore)} />

                  <Tabs defaultValue="details" className="w-full mt-4">
                    <TabsList>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      {results.reports && results.reports.length > 0 && <TabsTrigger value="reports">Reports ({results.reports.length})</TabsTrigger>}
                      <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="mt-4">
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Is Public</TableCell>
                            <TableCell>{results.isPublic ? "Yes" : "No"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">IP Version</TableCell>
                            <TableCell>{results.ipVersion}</TableCell>
                          </TableRow>
                          {results.countryName && (
                              <TableRow>
                                <TableCell className="font-medium">Country</TableCell>
                                <TableCell>{results.countryName} ({results.countryCode})</TableCell>
                              </TableRow>
                          )}
                          {results.usageType && (
                              <TableRow>
                                <TableCell className="font-medium">Usage Type</TableCell>
                                <TableCell>{results.usageType}</TableCell>
                              </TableRow>
                          )}
                          {results.isp && (
                              <TableRow>
                                <TableCell className="font-medium">ISP</TableCell>
                                <TableCell>{results.isp}</TableCell>
                              </TableRow>
                          )}
                          {results.domain && (
                              <TableRow>
                                <TableCell className="font-medium">Domain</TableCell>
                                <TableCell>{results.domain}</TableCell>
                              </TableRow>
                          )}
                          <TableRow>
                            <TableCell className="font-medium">Total Reports</TableCell>
                            <TableCell>{results.totalReports}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Last Reported</TableCell>
                            <TableCell>{results.lastReportedAt ? new Date(results.lastReportedAt).toLocaleString() : "N/A"}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TabsContent>

                    {results.reports && results.reports.length > 0 && (
                        <TabsContent value="reports" className="mt-4">
                          {results.reports.length > 100 && (
                              <p className="text-sm text-muted-foreground mb-2">
                                Displaying top 100 reports out of {results.reports.length} total reports.
                              </p>
                          )}
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Reported At</TableHead>
                                <TableHead>Comment</TableHead>
                                <TableHead>Categories</TableHead>
                                <TableHead>Reporter Country</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {results.reports.slice(0, 100).map((report, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{new Date(report.reportedAt).toLocaleString()}</TableCell>
                                    <TableCell className="max-w-xs truncate">{report.comment}</TableCell>
                                    <TableCell>{report.categories.join(', ')}</TableCell>
                                    <TableCell>{report.reporterCountryName}</TableCell>
                                  </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TabsContent>
                    )}

                    <TabsContent value="raw" className="mt-4">
                      <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-md">{JSON.stringify(results, null, 2)}</pre>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
        ) : (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-8">
              <h2 className="text-xl font-semibold mb-2 text-foreground">Check Malicious IP Addresses</h2>
              <p className="mb-4">Enter an IP address (IPv4 or IPv6) to check its abuse confidence score and detailed reports from AbuseIPDB.</p>
              <ul className="text-left max-w-md mx-auto list-disc list-inside space-y-1">
                <li>Enter an IP address in the search bar above.</li>
                <li>Click "Check IP" or press Enter.</li>
                <li>View details like abuse confidence score, country, ISP, and reported incidents.</li>
              </ul>
            </div>
        )}

        {/* Blacklist Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-4">
            <p className="text-sm">
              Malicious IP list refreshes every 30 minutes.
            </p>
            <Button
                variant="outline"
                size="sm"
                onClick={() => fetchBlacklist(true)} // Pass true to force refresh
                disabled={loadingBlacklist}
            >
              {loadingBlacklist ? <RotateCw className="h-4 w-4 animate-spin" /> : "Force Refresh"}
            </Button>
          </div>
          <Card className="bg-card border-border w-full">
            <CardHeader>
              <CardTitle className="text-lg">Latest Malicious IPs (AbuseIPDB Blacklist)</CardTitle>
              <CardDescription>Top reported IP addresses from AbuseIPDB.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                    type="text"
                    placeholder="Search IP address in blacklist..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-background"
                />
              </div>
              {loadingBlacklist ? (
                  <div className="flex items-center justify-center p-4">
                    <RotateCw className="h-5 w-5 animate-spin" />
                    <span className="ml-2">Loading blacklist...</span>
                  </div>
              ) : blacklistError ? (
                  <div className="text-center text-red-500 p-4">
                    Error loading blacklist: {blacklistError}
                  </div>
              ) : filteredBlacklist.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Confidence Score</TableHead>
                        <TableHead>Last Reported</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBlacklist.map((item, index) => (
                          <TableRow key={index} onClick={() => handleBlacklistIpClick(item.ipAddress)} className="cursor-pointer hover:bg-muted/50">
                            <TableCell>{item.ipAddress}</TableCell>
                            <TableCell>{item.abuseConfidenceScore}%</TableCell>
                            <TableCell>{item.lastReportedAt ? new Date(item.lastReportedAt).toLocaleString() : "N/A"}</TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              ) : (
                  <div className="text-center text-muted-foreground p-4">
                    No matching IP addresses found in blacklist.
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  )
};

export default MaliciousIpsTab;




