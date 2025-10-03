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
  const cveIds = searchParams.get('cveIds');
  const forceUpdate = searchParams.get('forceUpdate') === 'true';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '50');

  const client = new RedHatSecurityClient();

  if (cveIds) {
    try {
      const cacheConfig = {
        filename: `redhat-advisories-${cveIds.substring(0, 50)}.json`,
        expiryHours: 1
      };

      let data = !forceUpdate ? await DataCache.getNVDData(cacheConfig) : null;

      if (!data || forceUpdate) {
        const cveIdArray = cveIds.split(',');
        const advisories = (await Promise.all(
          cveIdArray.map(async cveId => {
            const advisory = await client.getCVEDetails(cveId);
            if (!advisory) return null;
            return advisory;
          })
        )).filter(a => a !== null);

        data = {
          advisories,
          total: advisories.length,
          timestamp: new Date().toISOString()
        };

        await DataCache.saveNVDData(data, cacheConfig.filename);
      }

      return NextResponse.json(data);
    } catch (error) {
      console.error('Error fetching Red Hat advisories:', error);
      return NextResponse.json({ error: 'Failed to fetch advisories' }, { status: 500 });
    }
  }

  // Handle single CVE request
  const cveId = searchParams.get('cveId');
  if (cveId) {
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

  return NextResponse.json({ error: 'cveId or cveIds parameter is required' }, { status: 400 });
}
