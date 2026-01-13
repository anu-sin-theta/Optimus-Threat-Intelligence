import { NextResponse } from 'next/server';
import { AbuseIPDBClient } from '@/lib/api-client/abuseIP';
import { DataCache } from '@/lib/data-cache';
import { RateLimiter } from '@/lib/rate-limiter';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');
  const maxAge = searchParams.get('maxAge');
  const networkCIDR = searchParams.get('network');

  if (!process.env.ABUSEIPDB_API_KEY) {
    return NextResponse.json({ error: 'AbuseIPDB API key not configured' }, { status: 500 });
  }

  const client = new AbuseIPDBClient(process.env.ABUSEIPDB_API_KEY);

  try {
    if (networkCIDR) {
      const cacheConfig = {
        filename: `abuseipdb-network-${networkCIDR.replace('/', '-')}.json`,
        expiryHours: 24
      };

      let data = await DataCache.getNVDData(cacheConfig);

      if (!data) {
        if (!(await RateLimiter.isAllowed('abuseipdb'))) {
          return NextResponse.json({ error: 'AbuseIPDB API rate limit exceeded' }, { status: 429 });
        }
        data = await client.checkIPBlock(networkCIDR, maxAge ? parseInt(maxAge) : 90);
        await DataCache.saveNVDData(data, cacheConfig.filename);
        await RateLimiter.increment('abuseipdb');
      }

      return NextResponse.json(data);
    }

    if (!ip) {
      return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
    }

    const cacheConfig = {
      filename: `abuseipdb-ip-${ip}.json`,
      expiryHours: 24
    };

    let data = await DataCache.getNVDData(cacheConfig);

    if (!data) {
      if (!(await RateLimiter.isAllowed('abuseipdb'))) {
        return NextResponse.json({ error: 'AbuseIPDB API rate limit exceeded' }, { status: 429 });
      }
      data = await client.checkIP(ip, maxAge ? parseInt(maxAge) : 90);
      await DataCache.saveNVDData(data, cacheConfig.filename);
      await RateLimiter.increment('abuseipdb');
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch AbuseIPDB data' }, { status: 500 });
  }
}
