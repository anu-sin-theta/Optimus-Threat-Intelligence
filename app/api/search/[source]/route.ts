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
  { params }: { params: { source: string } }
) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const forceUpdate = searchParams.get('forceUpdate') === 'true';
  const source = params.source;

  try {
    const databaseDir = path.join(process.cwd(), 'database');
    const files = fs.readdirSync(databaseDir)
      .filter(file => file.startsWith(source) && file.endsWith('.json'));

    if (files.length === 0) {
      // If no cached files found, trigger a force update
      const response = await fetch(`${request.headers.get('origin')}/api/${source}?forceUpdate=true`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${source} API`);
      }
      const data = await response.json();
      return NextResponse.json(data);
    }

    // Read the most recent cache file
    const latestFile = files.sort().pop();
    if (!latestFile) {
      throw new Error('No cache file found');
    }

    const cacheData = JSON.parse(fs.readFileSync(path.join(databaseDir, latestFile), 'utf-8'));

    if (query) {
      const searchableFields = {
        nvd: ['cve.id', 'cve.descriptions', 'cve.configurations'],
        redhat: ['title', 'cve_id', 'affected_packages', 'details'],
        cisa: ['cveID', 'vulnerabilityName', 'vendorProject', 'product', 'shortDescription'],
        mitre: ['id', 'name', 'tactic', 'description', 'platforms']
      };

      const fields = searchableFields[source as keyof SearchableFields] || ['id', 'description'];
      const dataArray = cacheData.vulnerabilities || cacheData.advisories || cacheData.techniques || [];
      const matches = searchInData(dataArray, query, fields);

      return NextResponse.json({
        data: matches,
        timestamp: cacheData.timestamp || new Date().toISOString()
      });
    }

    return NextResponse.json(cacheData);
  } catch (error) {
    console.error(`Error in search API (${source}):`, error);
    return NextResponse.json({
      error: `Failed to search ${source} data`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
