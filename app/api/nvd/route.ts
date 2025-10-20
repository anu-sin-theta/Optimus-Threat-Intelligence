import { NextResponse } from 'next/server';
import { NVDClient } from '@/lib/api-client/nvd';
import { DataCache } from '@/lib/data-cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = searchParams.get('days');
  const limit = parseInt(searchParams.get('limit') || '10000');
  const offset = parseInt(searchParams.get('offset') || '0');
  const forceUpdate = searchParams.get('forceUpdate') === 'true';

  if (!days) {
    return NextResponse.json({ error: 'Missing required days parameter' }, { status: 400 });
  }

  const cacheConfig = {
    filename: `nvd-recent-${days}days.json`,
    expiryHours: 1
  };

  if (!forceUpdate) {
    const cachedData = await DataCache.getNVDData(cacheConfig);
    if (cachedData) {
      const paginatedData = cachedData.vulnerabilities.slice(offset, offset + limit);
      return NextResponse.json({
        vulnerabilities: paginatedData,
        totalResults: cachedData.vulnerabilities.length,
        stats: cachedData.stats,
        source: 'cache'
      });
    }
  }

  const nvdClient = new NVDClient(process.env.NVD_API_KEY);

  try {
    const { vulnerabilities, totalResults, stats } = await nvdClient.getRecentCVEs(parseInt(days), limit, 0);
    const dataToCache = { vulnerabilities, totalResults, stats };
    await DataCache.saveNVDData(dataToCache, cacheConfig.filename);
    const paginatedData = vulnerabilities.slice(offset, offset + limit);

    return NextResponse.json({ vulnerabilities: paginatedData, totalResults, stats, source: 'nvd_api' });
  } catch (error) {
    console.warn(`NVD API failed for recent CVEs, attempting file cache fallback.`);
    try {
      const fallbackData = await DataCache.getNVDData({ filename: 'nvd-recent-7days.json', expiryHours: 24 });
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
