import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      'https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=1',
      { signal: controller.signal }
    );
    
    return NextResponse.json({
      status: response.ok ? 'healthy' : 'degraded',
      responseTime: Date.now(),
      httpStatus: response.status
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      lastCheck: Date.now()
    }, { status: 503 });
  }
}
