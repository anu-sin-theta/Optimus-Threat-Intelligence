
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SearchResultItem({ result }) {
  if (!result) return null;

  const isCve = result.cve?.id || result.id?.startsWith('CVE-');
  const isIoc = result.ioc;

  if (isCve) {
    const cve = result.cve || result;
    return (
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle>{cve.id}</CardTitle>
          <CardDescription>{cve.descriptions?.[0]?.value}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isIoc) {
    return (
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle>{result.ioc}</CardTitle>
          <CardDescription>{result.threat_type_desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge>{result.malware_printable}</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary/50">
      <CardContent>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
      </CardContent>
    </Card>
  );
}
