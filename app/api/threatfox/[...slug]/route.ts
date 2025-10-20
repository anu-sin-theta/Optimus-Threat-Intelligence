import { NextRequest, NextResponse } from 'next/server';
import { ThreatFoxClient } from '@/lib/api-client/threatfox';

export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {
  const { slug } = params;
  const [query, ...rest] = slug;
  const { searchParams } = new URL(req.url);

  const apiKey = process.env.THREATFOX_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'ThreatFox API key not configured' }, { status: 500 });
  }

  const client = new ThreatFoxClient(apiKey);

  try {
    let results;
    switch (query) {
      case 'ioc':
        results = await client.getIOCById(rest[0]);
        break;
      case 'search_hash':
        results = await client.searchIOCByHash(rest[0]);
        break;
      case 'taginfo':
        results = await client.getTagInfo(rest[0], searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 100);
        break;
      case 'malwareinfo':
        results = await client.getMalwareInfo(rest[0], searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 100);
        break;
      case 'malware_list':
        results = await client.getMalwareList();
        break;
      case 'types':
        results = await client.getIOCTypes();
        break;
      case 'tag_list':
        results = await client.getTagList();
        break;
      default:
        return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }
    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const [query, ...rest] = slug;
  const body = await req.json().catch(() => ({}));

  const apiKey = process.env.THREATFOX_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'ThreatFox API key not configured' }, { status: 500 });
  }

  const client = new ThreatFoxClient(apiKey);

  try {
    let results;
    switch (query) {
      case 'ioc':
        results = await client.getIOCById(rest[0]);
        break;
      case 'search_hash':
        results = await client.searchIOCByHash(rest[0]);
        break;
      case 'taginfo':
        results = await client.getTagInfo(rest[0], body.limit);
        break;
      case 'malwareinfo':
        results = await client.getMalwareInfo(rest[0], body.limit);
        break;
      case 'malware_list':
        results = await client.getMalwareList();
        break;
      case 'types':
        results = await client.getIOCTypes();
        break;
      case 'tag_list':
        results = await client.getTagList();
        break;
      default:
        return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }
    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
