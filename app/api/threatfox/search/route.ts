import { NextRequest, NextResponse } from 'next/server';
import { ThreatFoxClient } from '@/lib/api-client/threatfox';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ioc = searchParams.get('ioc');

  const apiKey = process.env.THREATFOX_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'ThreatFox API key not configured' }, { status: 500 });
  }

  if (!ioc) {
    return NextResponse.json({ error: 'IOC is required' }, { status: 400 });
  }

  const client = new ThreatFoxClient(apiKey);

  try {
    const results = await client.searchIOC(ioc);
    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
