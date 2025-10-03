"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ExternalLink, AlertTriangle, RotateCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PageProps {
  params: Promise<{ id: string }>
}

interface ErrorState {
  message: string;
  details?: string;
  status?: number;
}

interface CWEDetails {
  ID: string;
  Name: string;
  Abstraction?: string;
  Structure?: string;
  Status?: string;
  Description: string;
  ExtendedDescription?: string;
  LikelihoodOfExploit?: string;
  CommonConsequences?: any[];
  DetectionMethods?: any[];
  PotentialMitigations?: any[];
  DemonstrativeExamples?: any[];
  ObservedExamples?: any[];
  WeaknessOrdinalities?: any[];
  ApplicablePlatforms?: any[];
  AlternateTerms?: any[];
  ModesOfIntroduction?: any[];
  References?: any[];
  Notes?: any[];
  RelatedWeaknesses?: any[];
}

export default function VulnerabilityDetailsPage({ params }: PageProps) {
  const router = useRouter()
  const [vulnerability, setVulnerability] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ErrorState | null>(null)
  const [selectedCwe, setSelectedCwe] = useState<CWEDetails | null>(null)
  const [cweLoading, setCweLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const { id } = use(params)

  useEffect(() => {
    const fetchVulnerability = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/nvd/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw {
            message: data.error || 'Failed to fetch vulnerability details',
            details: data.details,
            status: response.status
          };
        }

        // Validate and set the vulnerability data
        if (data?.vulnerabilities?.[0]?.cve) {
          console.log('Received vulnerability data:', data);
          setVulnerability(data);
        } else {
          throw {
            message: 'Invalid vulnerability data structure',
            status: 500
          };
        }
      } catch (error: any) {
        console.error("Error fetching vulnerability:", error)
        setError({
          message: error.message || 'An unexpected error occurred',
          details: error.details,
          status: error.status || 500
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVulnerability()
  }, [id])

  const handleCweClick = async (cweId: string) => {
    setCweLoading(true)
    setActiveTab('weaknesses') // Switch to weaknesses tab when CWE is clicked

    try {
      const response = await fetch(`/api/cwe/${cweId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch CWE details')
      }

      if (data.Weaknesses?.[0]) {
        setSelectedCwe(data.Weaknesses[0])
      } else {
        throw new Error('CWE data not found')
      }
    } catch (error) {
      console.error("Error fetching CWE details:", error)
    } finally {
      setCweLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vulnerabilities
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center p-16">
            <div className="flex items-center gap-2">
              <RotateCw className="h-5 w-5 animate-spin" />
              <span className="text-muted-foreground">Loading vulnerability details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vulnerabilities
        </Button>
        <Card className={error.status === 404 ? "border-muted" : "bg-destructive/10 border-destructive"}>
          <CardHeader>
            <CardTitle className={
              error.status === 404 ? "text-muted-foreground" : "text-destructive flex items-center gap-2"
            }>
              {error.status !== 404 && <AlertTriangle className="h-5 w-5" />}
              {error.status === 404 ? 'Vulnerability Not Found' : 'Error Loading Vulnerability'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className={error.status === 404 ? "text-muted-foreground" : "text-destructive"}>
              {error.message}
            </p>
            {error.details && (
              <p className="text-sm text-muted-foreground">
                {error.details}
              </p>
            )}
            {error.status === 404 && (
              <div className="flex flex-col gap-4 mt-6">
                <p className="text-sm text-muted-foreground">
                  This could be because:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                  <li>The CVE ID might be incorrect</li>
                  <li>The vulnerability hasn't been published in the NVD database yet</li>
                  <li>The CVE is still under review or analysis</li>
                </ul>
                <div className="flex gap-4 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                  >
                    Go Back
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      Check on NVD Website
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!vulnerability?.vulnerabilities?.[0]?.cve) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vulnerabilities
        </Button>
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-muted-foreground">Vulnerability Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested vulnerability ({id}) could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cve = vulnerability.vulnerabilities[0].cve;
  const cvssData = cve.metrics?.cvssMetricV40?.[0]?.cvssData ||
                  cve.metrics?.cvssMetricV31?.[0]?.cvssData ||
                  cve.metrics?.cvssMetricV30?.[0]?.cvssData ||
                  cve.metrics?.cvssMetricV2?.[0]?.cvssData;

  const description = cve.descriptions?.find((desc: any) => desc.lang === 'en')?.value ||
                     cve.descriptions?.[0]?.value ||
                     'No description available';

  // Helper function to format CVSS metric keys
  const formatMetricKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => {
        // Handle special cases
        if (word.length <= 2) return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  // Group CVSS metrics by category
  const groupCVSSMetrics = (cvssData: any) => {
    const groups: { [key: string]: { [key: string]: any } } = {
      'Base Metrics': {},
      'Impact Metrics': {},
      'Modified Base Metrics': {},
      'Environmental Metrics': {},
      'Other': {}
    };

    Object.entries(cvssData).forEach(([key, value]) => {
      if (key === 'version' || key === 'vectorString' || key === 'baseSeverity' || key === 'baseScore') return;

      if (key.startsWith('M')) {
        groups['Modified Base Metrics'][key] = value;
      } else if (['E', 'RL', 'RC', 'CR', 'IR', 'AR'].includes(key)) {
        groups['Environmental Metrics'][key] = value;
      } else if (['C', 'I', 'A', 'VC', 'VI', 'VA'].includes(key)) {
        groups['Impact Metrics'][key] = value;
      } else if (['AV', 'AC', 'PR', 'UI', 'S'].includes(key)) {
        groups['Base Metrics'][key] = value;
      } else {
        groups['Other'][key] = value;
      }
    });

    // Remove empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, metrics]) => Object.keys(metrics).length > 0)
    );
  };

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Vulnerabilities
      </Button>

      <div className="space-y-6">
        {/* Header section with CVE ID and severity */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{cve.id}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge
                variant={
                  cvssData?.baseSeverity === "CRITICAL"
                    ? "destructive"
                    : cvssData?.baseSeverity === "HIGH"
                    ? "default"
                    : "secondary"
                }
              >
                {cvssData?.baseSeverity || cve.vulnStatus || 'UNKNOWN'}
              </Badge>
              {cvssData?.baseScore && (
                <span className="text-2xl font-bold text-primary">{cvssData.baseScore}</span>
              )}
              <Badge variant="outline">{cve.vulnStatus}</Badge>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://nvd.nist.gov/vuln/detail/${cve.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  View on NVD
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-muted/50 p-0 h-12">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-background rounded-none h-12"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="technical"
              className="data-[state=active]:bg-background rounded-none h-12"
            >
              Technical Details
            </TabsTrigger>
            <TabsTrigger
              value="weaknesses"
              className="data-[state=active]:bg-background rounded-none h-12"
            >
              Weaknesses
            </TabsTrigger>
            <TabsTrigger
              value="references"
              className="data-[state=active]:bg-background rounded-none h-12"
            >
              References
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6">
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Published:</span>{' '}
                      {new Date(cve.published).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Last Modified:</span>{' '}
                      {new Date(cve.lastModified).toLocaleString()}
                    </div>
                    {cve.sourceIdentifier && (
                      <div>
                        <span className="font-medium">Source:</span>{' '}
                        {cve.sourceIdentifier}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical">
              {cvssData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>CVSS Details</span>
                      {cvssData.baseScore && (
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              cvssData.baseSeverity === "CRITICAL"
                                ? "destructive"
                                : cvssData.baseSeverity === "HIGH"
                                ? "default"
                                : "secondary"
                            }
                            className="text-lg px-3 py-1"
                          >
                            {cvssData.baseSeverity}
                          </Badge>
                          <span className="text-2xl font-bold text-primary">{cvssData.baseScore}</span>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {cvssData.vectorString && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-muted-foreground mb-2">Vector String</dt>
                        <dd className="font-mono text-sm bg-muted p-3 rounded-md break-all">
                          {cvssData.vectorString}
                        </dd>
                      </div>
                    )}

                    <div className="grid gap-6">
                      {Object.entries(groupCVSSMetrics(cvssData)).map(([groupName, metrics]) => (
                        <div key={groupName}>
                          <h3 className="text-sm font-semibold mb-3">{groupName}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Object.entries(metrics).map(([key, value]) => (
                              <div key={key} className="space-y-1.5 bg-muted/50 p-3 rounded-lg">
                                <dt className="text-xs font-medium text-muted-foreground">
                                  {formatMetricKey(key)}
                                </dt>
                                <dd className="text-sm font-medium">{value}</dd>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="weaknesses">
              <div className="grid gap-6">
                {/* List of Weaknesses */}
                <Card>
                  <CardHeader>
                    <CardTitle>Associated Weaknesses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cve.weaknesses?.map((weakness: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg bg-muted/50 border cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => weakness.description?.[0]?.value &&
                            handleCweClick(weakness.description[0].value)}
                        >
                          {weakness.description?.map((desc: any, descIdx: number) => (
                            <div key={descIdx} className="mb-2">
                              <p className="text-sm">{desc.value}</p>
                              {desc.lang !== 'en' && (
                                <Badge variant="outline" className="mt-1">{desc.lang}</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Selected CWE Details */}
                {cweLoading ? (
                  <Card>
                    <CardContent className="flex items-center justify-center p-8">
                      <div className="animate-pulse text-muted-foreground">
                        Loading CWE details...
                      </div>
                    </CardContent>
                  </Card>
                ) : selectedCwe ? (
                  <div className="grid gap-6">
                    {/* Overview Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span>CWE-{selectedCwe.ID}: {selectedCwe.Name}</span>
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={`https://cwe.mitre.org/data/definitions/${selectedCwe.ID}.html`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2"
                                >
                                  View on MITRE
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-normal">
                              <Badge variant="outline">{selectedCwe.Abstraction}</Badge>
                              <Badge variant="outline">{selectedCwe.Structure}</Badge>
                              <Badge variant="outline">{selectedCwe.Status}</Badge>
                            </div>
                          </div>
                          {selectedCwe.LikelihoodOfExploit && (
                            <Badge
                              variant={
                                selectedCwe.LikelihoodOfExploit === "High" ? "destructive" :
                                selectedCwe.LikelihoodOfExploit === "Medium" ? "default" :
                                "secondary"
                              }
                            >
                              {selectedCwe.LikelihoodOfExploit} Likelihood
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Description</h3>
                            <p className="text-muted-foreground">{selectedCwe.Description}</p>
                          </div>
                          {selectedCwe.ExtendedDescription && (
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2">
                                  Extended Description
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                                  {selectedCwe.ExtendedDescription}
                                </p>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Related Weaknesses */}
                    {selectedCwe.RelatedWeaknesses?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Related Weaknesses</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedCwe.RelatedWeaknesses.map((rw: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                                <Badge variant="default" className="font-mono">CWE-{rw.CweID}</Badge>
                                <Badge variant="outline">{rw.Nature}</Badge>
                                {rw.Ordinal && <Badge variant="secondary">{rw.Ordinal}</Badge>}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Common Consequences */}
                    {selectedCwe.CommonConsequences?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Common Consequences</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {selectedCwe.CommonConsequences.map((cc: any, idx: number) => (
                              <div key={idx} className="p-4 rounded-lg bg-muted/50 border">
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {cc.Scope?.map((scope: string, i: number) => (
                                    <Badge key={i} variant="secondary">{scope}</Badge>
                                  ))}
                                </div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {cc.Impact?.map((impact: string, i: number) => (
                                    <Badge key={i} variant="outline">{impact}</Badge>
                                  ))}
                                </div>
                                {cc.Note && (
                                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{cc.Note}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Detection Methods */}
                    {selectedCwe.DetectionMethods?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Detection Methods</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {selectedCwe.DetectionMethods.map((dm: any, idx: number) => (
                              <Collapsible key={idx}>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" className="flex items-center justify-between w-full">
                                    <span>{dm.Method}</span>
                                    {dm.Effectiveness && (
                                      <Badge variant={
                                        dm.Effectiveness.includes("High") ? "default" :
                                        dm.Effectiveness.includes("SOAR") ? "secondary" :
                                        "outline"
                                      }>
                                        {dm.Effectiveness}
                                      </Badge>
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="p-4 mt-2 rounded-lg bg-muted/50">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{dm.Description}</p>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Potential Mitigations */}
                    {selectedCwe.PotentialMitigations?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Potential Mitigations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {selectedCwe.PotentialMitigations.map((pm: any, idx: number) => (
                              <Collapsible key={idx}>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" className="flex items-center gap-2 w-full justify-start">
                                    <div className="flex items-center gap-2">
                                      {pm.Phase?.map((phase: string, i: number) => (
                                        <Badge key={i} variant="default">{phase}</Badge>
                                      ))}
                                      {pm.Strategy && (
                                        <Badge variant="outline">{pm.Strategy}</Badge>
                                      )}
                                    </div>
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="p-4 mt-2 rounded-lg bg-muted/50 space-y-2">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{pm.Description}</p>
                                    {pm.Effectiveness && (
                                      <Badge variant="secondary">Effectiveness: {pm.Effectiveness}</Badge>
                                    )}
                                    {pm.EffectivenessNotes && (
                                      <p className="text-xs text-muted-foreground">{pm.EffectivenessNotes}</p>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Demonstrative Examples */}
                    {selectedCwe.DemonstrativeExamples?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Demonstrative Examples</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {selectedCwe.DemonstrativeExamples.map((ex: any, idx: number) => (
                              <Collapsible key={idx}>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" className="flex items-center gap-2 w-full justify-start">
                                    Example {idx + 1}
                                    {ex.ID && <Badge variant="outline">{ex.ID}</Badge>}
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="p-4 mt-2 rounded-lg bg-muted/50 space-y-4">
                                    {ex.Entries?.map((entry: any, eidx: number) => (
                                      <div key={eidx} className="space-y-2">
                                        {entry.IntroText && (
                                          <p className="font-medium">{entry.IntroText}</p>
                                        )}
                                        {entry.BodyText && (
                                          <p className="text-sm text-muted-foreground">{entry.BodyText}</p>
                                        )}
                                        {entry.ExampleCode && (
                                          <div className="relative">
                                            <div className="absolute right-2 top-2 flex items-center gap-2">
                                              {entry.Nature && <Badge variant="outline">{entry.Nature}</Badge>}
                                              {entry.Language && <Badge variant="secondary">{entry.Language}</Badge>}
                                            </div>
                                            <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                                              <code>{entry.ExampleCode}</code>
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Observed Examples */}
                    {selectedCwe.ObservedExamples?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Observed Examples (CVEs)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedCwe.ObservedExamples.map((oe: any, idx: number) => (
                              <div key={idx} className="p-4 rounded-lg bg-muted/50 border">
                                <a
                                  href={oe.Link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline font-medium inline-flex items-center gap-2"
                                >
                                  {oe.Reference}
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                                <p className="text-sm text-muted-foreground mt-2">{oe.Description}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Platform Applicability */}
                    {selectedCwe.ApplicablePlatforms?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Applicable Platforms</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {selectedCwe.ApplicablePlatforms.map((ap: any, idx: number) => (
                              <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/50 border">
                                <Badge variant="outline">{ap.Type}</Badge>
                                <span className="text-sm">{ap.Name || ap.Class}</span>
                                {ap.Prevalence && (
                                  <Badge variant="secondary">{ap.Prevalence}</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Additional Info */}
                    {(selectedCwe.AlternateTerms?.length > 0 ||
                      selectedCwe.ModesOfIntroduction?.length > 0 ||
                      selectedCwe.Notes?.length > 0) && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {selectedCwe.AlternateTerms?.length > 0 && (
                              <div>
                                <h3 className="text-sm font-semibold mb-3">Alternate Terms</h3>
                                <div className="space-y-3">
                                  {selectedCwe.AlternateTerms.map((at: any, idx: number) => (
                                    <div key={idx} className="p-3 rounded-lg bg-muted/50 border">
                                      <p className="font-medium">{at.Term}</p>
                                      <p className="text-sm text-muted-foreground mt-1">{at.Description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {selectedCwe.ModesOfIntroduction?.length > 0 && (
                              <div>
                                <h3 className="text-sm font-semibold mb-3">Modes of Introduction</h3>
                                <div className="space-y-2">
                                  {selectedCwe.ModesOfIntroduction.map((mi: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border">
                                      <Badge variant="default">{mi.Phase}</Badge>
                                      {mi.Note && <p className="text-sm text-muted-foreground">{mi.Note}</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {selectedCwe.Notes?.length > 0 && (
                              <div>
                                <h3 className="text-sm font-semibold mb-3">Notes</h3>
                                <div className="space-y-3">
                                  {selectedCwe.Notes.map((note: any, idx: number) => (
                                    <div key={idx} className="p-3 rounded-lg bg-muted/50 border">
                                      <Badge variant="outline" className="mb-2">{note.Type}</Badge>
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.Note}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* References */}
                    {selectedCwe.References?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>References</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedCwe.References.map((ref: any, idx: number) => (
                              <div key={idx} className="p-4 rounded-lg bg-muted/50 border">
                                {ref.URL ? (
                                  <a
                                    href={ref.URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline font-medium inline-flex items-center gap-2"
                                  >
                                    {ref.Title || ref.ExternalReferenceID}
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                ) : (
                                  <span className="font-medium">{ref.Title || ref.ExternalReferenceID}</span>
                                )}
                                <div className="text-sm text-muted-foreground mt-2">
                                  {ref.Authors?.length > 0 && (
                                    <p>by {ref.Authors.join(', ')}</p>
                                  )}
                                  {ref.PublicationYear && (
                                    <Badge variant="outline" className="mt-1">
                                      {ref.PublicationYear}
                                    </Badge>
                                  )}
                                  {ref.Section && (
                                    <p className="mt-1 text-xs">{ref.Section}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center text-muted-foreground p-8">
                      Select a weakness to view its details
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="references">
              {cve.references?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>References</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cve.references.map((ref: any, idx: number) => (
                        <div key={idx} className="flex flex-col gap-2">
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-2"
                          >
                            {ref.url}
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          {ref.tags && (
                            <div className="flex flex-wrap gap-2">
                              {ref.tags.map((tag: string, tagIdx: number) => (
                                <Badge key={tagIdx} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
