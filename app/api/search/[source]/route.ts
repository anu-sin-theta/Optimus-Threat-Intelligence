import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface SearchableFields {
  nvd: string[];
  redhat: string[];
  cisa: string[];
  mitre: string[];
}

const searchInData = (data: any[], query: string, fields: string[]): any[] => {
  const searchTerms = query.toLowerCase().split(' ');
  return data.filter(item =>
    searchTerms.every(term =>
      fields.some(field => {
        // Special handling for NVD descriptions
        if (field === 'cve.descriptions') {
          return item.cve?.descriptions?.some((desc: { value: string; }) =>
            desc.value.toLowerCase().includes(term)
          );
        }

        // Special handling for NVD configurations (vendor/product)
        if (field === 'cve.configurations') {
          return item.cve?.configurations?.some((config: any) =>
            config.nodes?.some((node: any) =>
              node.cpeMatch?.some((cpe: any) =>
                cpe.criteria?.toLowerCase().includes(term)
              )
            )
          );
        }

        const value = field.split('.').reduce((o, i) => o?.[i], item);
        if (Array.isArray(value)) {
          return value.some(v => typeof v === 'string' && v.toLowerCase().includes(term));
        }
        return typeof value === 'string' && value.toLowerCase().includes(term);
      })
    )
  );
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ source: string }> }
) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const forceUpdate = searchParams.get('forceUpdate') === 'true';
  const { source } = await params;

  try {
    if (source === 'threat') {
        const baseUrl = request.nextUrl.clone().origin;
        const response = await fetch(`${baseUrl}/api/enriched-vulnerabilities`);
        const enrichedData = await response.json();
        const results = enrichedData.vulnerabilities.filter(v => 
            JSON.stringify(v).toLowerCase().includes(query.toLowerCase())
        );
        return NextResponse.json({ data: results, timestamp: new Date().toISOString() });
    }

    const databaseDir = path.join(process.cwd(), 'database');
    const files = fs.readdirSync(databaseDir)
      .filter(file => file.startsWith(source) && file.endsWith('.json'));

    if (files.length === 0 && source !== 'ioc') {
      // If no cached files found, trigger a force update
      const baseUrl = request.nextUrl.clone().origin;
      const response = await fetch(`${baseUrl}/api/${source}?forceUpdate=true`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${source} API`);
      }
      const data = await response.json();
      return NextResponse.json(data);
    }

    let allData: any[] = [];
    for (const file of files) {
      const fileData = JSON.parse(fs.readFileSync(path.join(databaseDir, file), 'utf-8'));
      const dataArray = fileData.vulnerabilities || fileData.advisories || fileData.techniques || fileData.data || [];
      allData.push(...dataArray);
    }

    if (query) {
      const searchableFields = {
        nvd: ['cve.id', 'cve.descriptions', 'cve.configurations'],
        redhat: ['title', 'cve_id', 'affected_packages', 'details'],
        cisa: ['cveID', 'vulnerabilityName', 'vendorProject', 'product', 'shortDescription'],
        mitre: ['id', 'name', 'tactic', 'description', 'platforms'],
        ioc: ['ioc', 'threat_type', 'malware_printable']
      };

      const fields = searchableFields[source as keyof SearchableFields] || ['id', 'description'];
      const matches = searchInData(allData, query, fields);

      return NextResponse.json({
        data: matches,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ data: allData, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error(`Error in search API (${source}):`, error);
    return NextResponse.json({
      error: `Failed to search ${source} data`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
