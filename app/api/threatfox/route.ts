import { NextResponse } from 'next/server';
import { ThreatFoxClient } from '@/lib/api-client/threat-intel';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  const client = new ThreatFoxClient(process.env.THREATFOX_API_KEY);

  try {
    const data = await client.getRecentMaliciousIPs(format as 'json' | 'csv');
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ThreatFox data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const client = new ThreatFoxClient(process.env.THREATFOX_API_KEY);

  try {
    const body = await request.json();
    const { iocValue, iocType } = body;

    if (!iocValue) {
      return NextResponse.json({ error: 'IOC value is required' }, { status: 400 });
    }

    const data = await client.searchIOC(iocValue, iocType);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search IOC' }, { status: 500 });
  }
}
