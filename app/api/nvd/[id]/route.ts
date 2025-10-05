import { NextResponse } from 'next/server';
import { NVDClient } from '@/lib/api-client/nvd';
import { VulnersClient } from '@/lib/api-client/vulners';

// Vulners as backup for CVE data
const vulnersBackup = async (cveId: string) => {
  if (!process.env.VULNERS_API_KEY) {
    throw new Error('Vulners API key is not configured.');
  }
  const client = new VulnersClient(process.env.VULNERS_API_KEY);
  const vulnersData = await client.getByIds([cveId]);

  if (!vulnersData || vulnersData.length === 0) {
    throw new Error('CVE not found in Vulners.');
  }

  // Transform Vulners data to NVD-like structure
  const cve = vulnersData[0];
  return {
    vulnerabilities: [
      {
        cve: {
          id: cve.id,
          descriptions: [{ lang: 'en', value: cve.description }],
          metrics: {
            cvssMetricV31: [
              {
                cvssData: {
                  baseScore: cve.cvss3?.score,
                  baseSeverity: cve.cvss3?.severity,
                  vectorString: cve.cvss3?.vector
                }
              }
            ]
          },
          weaknesses: cve.cwe?.map((cweId: string) => ({ description: [{ lang: 'en', value: cweId }] })) || [],
          published: cve.published,
          lastModified: cve.modified,
          references: cve.references?.map((ref: any) => ({ url: ref.href, source: ref.source })) || []
        }
      }
    ]
  };
};

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
    console.warn(`NVD API failed for ${cveId}, attempting Vulners fallback.`);
    try {
      const vulnersData = await vulnersBackup(cveId);
      return NextResponse.json(vulnersData);
    } catch (vulnersError: any) {
      return NextResponse.json(
        {
          error: `CVE ${cveId} not found in NVD or Vulners`,
          details: vulnersError.message
        },
        { status: 404 }
      );
    }
  }
}