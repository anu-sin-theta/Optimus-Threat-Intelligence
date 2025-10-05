import { NextResponse } from 'next/server';
import { NVDClient } from '@/lib/api-client/nvd';
import { promises as fs } from 'fs';
import path from 'path';

// Define a simple in-memory cache for the fallback data
let fallbackCache: any = null;
let lastCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getFallbackCVEData() {
  const now = Date.now();
  if (fallbackCache && (now - lastCacheTime < CACHE_DURATION)) {
    console.log('Using cached fallback data.');
    return fallbackCache;
  }

  try {
    console.log('Reading fallback data from file.');
    const filePath = path.join(process.cwd(), 'database', 'nvd-recent-7days.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    const stats = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      UNKNOWN: 0,
    };

    data.vulnerabilities.forEach((vuln: any) => {
      const cvssData = vuln.cve.metrics?.cvssMetricV31?.[0]?.cvssData ||
                     vuln.cve.metrics?.cvssMetricV30?.[0]?.cvssData ||
                     vuln.cve.metrics?.cvssMetricV2?.[0]?.cvssData;
      const severity = cvssData?.baseSeverity || 'UNKNOWN';
      if (stats.hasOwnProperty(severity)) {
        (stats as any)[severity]++;
      }
    });

    data.stats = stats;
    fallbackCache = data;
    lastCacheTime = now;

    return data;
  } catch (error) {
    console.error('Failed to read or parse fallback data:', error);
    throw new Error('Fallback data is unavailable.');
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = searchParams.get('days');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!days) {
    return NextResponse.json({ error: 'Missing required days parameter' }, { status: 400 });
  }

  const nvdClient = new NVDClient(process.env.NVD_API_KEY);

  try {
    const { vulnerabilities, totalResults, stats } = await nvdClient.getRecentCVEs(parseInt(days), limit, offset);
    return NextResponse.json({ vulnerabilities, totalResults, stats, source: 'nvd_api' });
  } catch (error) {
    console.warn(`NVD API failed for recent CVEs, attempting file cache fallback.`);
    try {
      const fallbackData = await getFallbackCVEData();
      const paginatedData = fallbackData.vulnerabilities.slice(offset, offset + limit);

      return NextResponse.json({
        vulnerabilities: paginatedData,
        totalResults: fallbackData.vulnerabilities.length,
        stats: fallbackData.stats,
        source: 'fallback_cache',
        warning: 'NVD API unavailable, using cached data'
      });
    } catch (fallbackError) {
      return NextResponse.json({
        error: 'All data sources unavailable',
        details: 'NIST infrastructure issues and fallback failures - try again later',
      }, { status: 503 });
    }
  }
}