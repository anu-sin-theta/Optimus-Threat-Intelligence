import { NextResponse } from 'next/server';
import { RedHatSecurityClient } from '@/lib/api-client/redhat';
import { DataCache } from '@/lib/data-cache';
import fs from 'fs';
import path from 'path';

interface FormattedVulnerability {
  id: string;
  description: string;
  cvssScore: number;
  severity: string;
  publishedDate: string;
  lastModified: string;
  references: string[];
  cveId: string;
  weaknesses: string[];
}

interface NVDResponse {
  vulnerabilities: FormattedVulnerability[];
  totalCount: number;
  timestamp: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cveId = searchParams.get('cveId');
  const forceUpdate = searchParams.get('forceUpdate') === 'true';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '50');

  const client = new RedHatSecurityClient();

  // If no CVE ID is provided, return a list of recent advisories
  if (!cveId) {
    try {
      // Check cache for advisory list
      const cacheConfig = {
        filename: 'redhat-advisories.json',
        expiryHours: 1
      };

      let data = !forceUpdate ? await DataCache.getNVDData(cacheConfig) : null;

      if (!data || forceUpdate) {
        try {
          // First try to read from the NVD cache file
          const nvdResponse = await fetch('http://localhost:3000/api/nvd?days=7');
          if (!nvdResponse.ok) {
            throw new Error(`NVD API returned status: ${nvdResponse.status}`);
          }

          const nvdData = await nvdResponse.json() as NVDResponse;

          // Sort and filter vulnerabilities by CVSS score
          const sortedVulns = nvdData.vulnerabilities
            .filter(vuln => vuln.severity === 'CRITICAL' || vuln.severity === 'HIGH')
            .sort((a, b) => b.cvssScore - a.cvssScore);

          if (sortedVulns.length === 0) {
            return NextResponse.json({
              error: 'No critical or high severity vulnerabilities found'
            }, { status: 404 });
          }

          // Get Red Hat advisory information for these CVEs
          const advisories = await Promise.all(
            sortedVulns.map(async vuln => {
              const advisory = await client.getCVEDetails(vuln.cveId);
              return {
                ...advisory,
                nvdData: vuln
              };
            })
          );

          data = {
            advisories: advisories.filter(a => a !== null),
            total: advisories.length,
            timestamp: new Date().toISOString()
          };

          // Save to both JSON and CSV formats
          await DataCache.saveNVDData(data, cacheConfig.filename);

          // Save as CSV for easier data handling
          const csvPath = path.join(process.cwd(), 'database', 'redhat-advisories.csv');
          const csvContent = advisories
            .map(adv => [
              adv.id,
              adv.cve_id,
              adv.severity,
              adv.nvdData?.cvssScore || '',
              adv.title,
              adv.affected_packages.join(';'),
              adv.nvdData?.publishedDate || '',
              adv.resource_url
            ].join(','))
            .join('\n');

          fs.writeFileSync(csvPath,
            'id,cve_id,severity,cvss_score,title,affected_packages,published_date,resource_url\n' +
            csvContent
          );
        } catch (nvdError) {
          console.error('Error fetching NVD data:', nvdError);
          return NextResponse.json({ error: 'Failed to fetch NVD data' }, { status: 500 });
        }
      }

      // Handle pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = {
        ...data,
        advisories: data.advisories.slice(start, end),
        pagination: {
          page,
          pageSize,
          totalPages: Math.ceil(data.advisories.length / pageSize),
          totalItems: data.advisories.length
        }
      };

      return NextResponse.json(paginatedData);
    } catch (error) {
      console.error('Error fetching Red Hat advisories:', error);
      return NextResponse.json({ error: 'Failed to fetch advisories' }, { status: 500 });
    }
  }

  // Handle single CVE request
  try {
    const cacheConfig = {
      filename: `redhat-${cveId}.json`,
      expiryHours: 24
    };

    let data = !forceUpdate ? await DataCache.getNVDData(cacheConfig) : null;

    if (!data || forceUpdate) {
      data = await client.getCVEDetails(cveId);
      if (data) {
        await DataCache.saveNVDData(data, cacheConfig.filename);
      }
    }

    if (!data) {
      return NextResponse.json({
        error: 'CVE not found in Red Hat database',
        cveId
      }, { status: 404 });
    }

    // Try to get additional NVD data if available
    try {
      const nvdResponse = await fetch(`http://localhost:3000/api/nvd?cveId=${cveId}`);
      if (nvdResponse.ok) {
        const nvdData = await nvdResponse.json();
        data = {
          ...data,
          nvdData
        };
      }
    } catch (nvdError) {
      console.error('Error fetching NVD data for CVE:', nvdError);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Red Hat Security data:', error);
    return NextResponse.json({
      error: 'Failed to fetch Red Hat Security data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
