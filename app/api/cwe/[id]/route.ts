import { NextResponse } from 'next/server';

const CWE_API_ROOT = 'https://cwe-api.mitre.org/api/v1';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let cweIdFromParam = '';
  try {
    const { id } = await params;
    cweIdFromParam = id;
    const cweId = id.startsWith('CWE-') ? id.substring(4) : id;

    // First, try to get it as a weakness
    let response = await fetch(`${CWE_API_ROOT}/cwe/weakness/${cweId}`);

    // If not found as a weakness, try as a category
    if (response.status === 404) {
      response = await fetch(`${CWE_API_ROOT}/cwe/category/${cweId}`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: `Failed to fetch from CWE API: ${errorData.message}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error(`Error fetching CWE data for ${cweIdFromParam}:`, error);
    return NextResponse.json({
      error: `Failed to fetch CWE data`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}