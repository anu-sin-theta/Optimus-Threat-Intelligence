import { NextResponse } from 'next/server';
import { NVDClient } from '@/lib/api-client/nvd';
import { DataCache } from '@/lib/data-cache';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const cveId = params.id;

  try {
    // Check cache first
    const cacheConfig = {
      filename: `nvd-${cveId}.json`,
      expiryHours: 24
    };

    // Try to get data from cache
    const cachedData = await DataCache.getNVDData(cacheConfig);

    // Validate cached data structure
    if (cachedData?.vulnerabilities?.[0]?.cve) {
      console.log(`Found valid cached data for ${cveId}`);
      return NextResponse.json(cachedData);
    }

    // If not in cache or invalid cache, fetch from API
    console.log(`Fetching fresh data for ${cveId}`);
    const client = new NVDClient(process.env.NVD_API_KEY);
    const response = await client.getCVE(cveId);

    if (response?.vulnerabilities?.[0]?.cve) {
      // Save valid response to cache
      await DataCache.saveNVDData(response, cacheConfig.filename);
      return NextResponse.json(response);
    }

    return NextResponse.json(
      { error: `No valid data available for ${cveId}` },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Error in API route:', error);

    // Handle 404 specifically
    if (error.isNotFound || error.status === 404) {
      return NextResponse.json(
        { error: `CVE ${cveId} not found in NVD database` },
        { status: 404 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch CVE details',
        details: error.status ? `Status: ${error.status}` : undefined
      },
      { status: error.status || 500 }
    );
  }
}
