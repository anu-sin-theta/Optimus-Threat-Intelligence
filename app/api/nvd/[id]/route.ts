import { NextResponse } from 'next/server';
import { NVDClient } from '@/lib/api-client/nvd';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const cveId = params.id;

  try {
    const client = new NVDClient(process.env.NVD_API_KEY);
    const response = await client.getCVE(cveId);

    if (response?.vulnerabilities?.[0]?.cve) {
      return NextResponse.json(response);
    }

    return NextResponse.json(
      { error: `No valid data available for ${cveId}` },
      { status: 404 }
    );
  } catch (error: any) {
    console.error(`Failed to fetch CVE ${cveId} from NVD:`, error);
    return NextResponse.json(
      {
        error: `Failed to fetch CVE ${cveId} from NVD`,
        details: error.message
      },
      { status: 500 }
    );
  }
}
