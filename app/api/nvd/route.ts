import { NextResponse } from 'next/server';
import { NVDClient } from '@/lib/api-client/nvd';
import { DataCache } from '@/lib/data-cache';

interface CVEData {
  id: string;
  description: string;
  cvssScore: number;
  severity: string;
  vendor: string;
  product: string;
  published: string;
  lastModified: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cveId = searchParams.get('cveId');
  const days = searchParams.get('days');
  const forceUpdate = searchParams.get('forceUpdate') === 'true';
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;
  const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : 0;
  const severity = searchParams.get('severity');

  const client = new NVDClient(process.env.NVD_API_KEY);

  try {
    if (cveId) {
      // Handle single CVE request
      const cacheConfig = {
        filename: `nvd-${cveId}.json`,
        expiryHours: 24
      };

      let data = !forceUpdate ? await DataCache.getNVDData(cacheConfig) : null;

      if (!data || forceUpdate) {
        const response = await client.getCVE(cveId);
        if (response?.vulnerabilities?.[0]) {
          data = response.vulnerabilities[0];
          await DataCache.saveNVDData(data, cacheConfig.filename);
        }
      }

      if (!data) {
        return NextResponse.json({ error: 'CVE not found' }, { status: 404 });
      }

      return NextResponse.json(data);
    } else if (days) {
      // Handle recent CVEs request
      const cacheConfig = {
        filename: `nvd-recent-${days}days.json`,
        expiryHours: 1
      };

      let data = !forceUpdate ? await DataCache.getNVDData(cacheConfig) : null;

      if (!data || forceUpdate) {
        const response = await client.getRecentCVEs(Number(days));

        if (response?.vulnerabilities) {
          // Process and validate each vulnerability
          const processedVulns = response.vulnerabilities
            .filter(vuln => vuln && vuln.cve)
            .map(vuln => {
              const cve = vuln.cve;

              // Get primary description in English
              const description = cve.descriptions?.find((desc: { lang: string; }) => desc.lang === 'en')?.value ||
                                cve.descriptions?.[0]?.value ||
                                'No description available';

              // Get CVSS data with fallbacks
              const cvssData = cve.metrics?.cvssMetricV31?.[0]?.cvssData ||
                             cve.metrics?.cvssMetricV30?.[0]?.cvssData ||
                             cve.metrics?.cvssMetricV2?.[0]?.cvssData;

              // Get vendor and product info from configurations
              const vendorInfo = cve.configurations?.[0]?.nodes?.[0]?.cpeMatch?.[0] || {};
              const vendor = vendorInfo.criteria?.split(':')[3] || 'Unknown';
              const product = vendorInfo.criteria?.split(':')[4] || 'Unknown';

              return {
                ...vuln,
                cve: {
                  ...cve,
                  processedData: {
                    description,
                    severity: cvssData?.baseSeverity || 'UNKNOWN',
                    score: cvssData?.baseScore || 0,
                    vector: cvssData?.vectorString || '',
                    vendor,
                    product,
                  }
                }
              };
            });

          data = {
            vulnerabilities: processedVulns,
            timestamp: new Date().toISOString()
          };

          await DataCache.saveNVDData(data, cacheConfig.filename);
        }
      }

      if (!data?.vulnerabilities) {
        return NextResponse.json({ error: 'No vulnerabilities found' }, { status: 404 });
      }

      const stats = {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
        UNKNOWN: 0,
      };
      data.vulnerabilities.forEach((vuln: any) => {
        const severity = vuln.cve?.processedData?.severity || 'UNKNOWN';
        if (stats.hasOwnProperty(severity)) {
          (stats as any)[severity]++;
        }
      });

      let filteredVulnerabilities = data.vulnerabilities;
      if (severity) {
        const severityFilters = severity.split(',');
        filteredVulnerabilities = data.vulnerabilities.filter((vuln: any) =>
          severityFilters.includes(vuln.cve?.processedData?.severity)
        );
      }

      const totalResults = filteredVulnerabilities.length;
      const paginatedVulnerabilities = limit ? filteredVulnerabilities.slice(offset, offset + limit) : filteredVulnerabilities;

      return NextResponse.json({
        vulnerabilities: paginatedVulnerabilities,
        totalResults,
        stats
      });
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching NVD data:', error);
    return NextResponse.json({
      error: 'Failed to fetch NVD data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
