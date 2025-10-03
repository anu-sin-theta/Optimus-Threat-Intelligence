import { NextResponse } from 'next/server';
import { VulnersClient } from '@/lib/api-client/vulners';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const id = searchParams.get('id');
  const references = searchParams.get('references');
  const exploitsCve = searchParams.get('exploits-cve');

  const logs = [];
  logs.push(`search: ${search}`);

  try {
    const client = new VulnersClient(process.env.VULNERS_API_KEY || '');
    let results;

    if (search) {
      results = await client.searchByLucene(search);
    } else if (id) {
      results = await client.getById(id);
    } else if (references) {
      results = await client.getReferences(references);
    } else if (exploitsCve) {
      results = await client.getExploitsForCve(exploitsCve);
    }

    logs.push(`results: ${JSON.stringify(results)}`);

    return NextResponse.json({ results, logs });
  } catch (error) {
    console.error('Error in Vulners API route:', error);
    logs.push(`error: ${error.message}`);
    return NextResponse.json({
      error: 'Failed to fetch Vulners data',
      details: error instanceof Error ? error.message : 'Unknown error',
      logs,
    }, { status: 500 });
  }
}
