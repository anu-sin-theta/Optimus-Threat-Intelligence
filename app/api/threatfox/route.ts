import { NextResponse } from 'next/server';
import { ThreatFoxClient } from '@/lib/api-client/threatfox';

export async function POST(request: Request) {
  const { ioc } = await request.json();

  if (!ioc) {
    return NextResponse.json({ error: 'IOC is required' }, { status: 400 });
  }

  const apiKey = process.env.THREATFOX_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'ThreatFox API key is not configured' }, { status: 500 });
  }

  try {
    const client = new ThreatFoxClient(apiKey);
    const data = await client.searchIOC(ioc);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error searching IOC in ThreatFox: ${ioc}`, error);
    return NextResponse.json({ error: 'Failed to search IOC in ThreatFox' }, { status: 500 });
  }
}
