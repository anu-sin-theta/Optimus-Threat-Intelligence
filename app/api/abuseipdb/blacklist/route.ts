import { NextResponse } from 'next/server';
import { DataCache } from '@/lib/data-cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.ABUSEIPDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'ABUSEIPDB_API_KEY is not set' }, { status: 500 });
  }

  const confidenceMinimum = searchParams.get('confidenceMinimum') || '90'; // Default to 90%
  const limit = searchParams.get('limit') || '100'; // Default to 100 IPs
  const forceRefresh = searchParams.get('forceRefresh') === 'true';

  const cacheConfig = {
    filename: `abuseipdb-blacklist-${confidenceMinimum}-${limit}.json`,
    expiryHours: 0.5 // 30 minutes
  };

  let data = null;
  if (!forceRefresh) {
    data = await DataCache.getNVDData(cacheConfig);
  }

  if (data) {
    return NextResponse.json(data);
  }

  try {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/blacklist?confidenceMinimum=${confidenceMinimum}&limit=${limit}`, {
      headers: {
        'Key': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    data = await response.json();
    await DataCache.saveNVDData(data, cacheConfig.filename);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching AbuseIPDB blacklist:', error);
    return NextResponse.json({ error: 'Failed to fetch blacklist from AbuseIPDB' }, { status: 500 });
  }
}
