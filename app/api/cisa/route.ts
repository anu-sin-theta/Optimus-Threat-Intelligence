import { NextResponse } from 'next/server';
import { CISAKEVClient } from '@/lib/api-client/cisa';
import { DataCache } from '@/lib/data-cache';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceUpdate = searchParams.get('forceUpdate') === 'true';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '50');
  const days = searchParams.get('days');
  const due = searchParams.get('due');

  const client = new CISAKEVClient();

  try {
    // Check cache first
    const cacheConfig = {
      filename: days ? `cisa-kev-${days}days.json` : 'cisa-kev.json',
      expiryHours: 1
    };

    let data = !forceUpdate ? await DataCache.getNVDData(cacheConfig) : null;

    if (!data || forceUpdate) {
      // Fetch fresh data
      const kevData = days ?
        await client.getRecentKEVAdditions(parseInt(days)) :
        await client.downloadKEVCatalog();

      if (!kevData?.vulnerabilities) {
        return NextResponse.json({ error: 'No KEV data found' }, { status: 404 });
      }

      // Format and enrich the data
      const formattedData = {
        vulnerabilities: kevData.vulnerabilities.map(vuln => ({
          ...vuln,
          dueDate: vuln.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days if not specified
          dateAdded: vuln.dateAdded || new Date().toISOString()
        })),
        total: kevData.vulnerabilities.length,
        timestamp: new Date().toISOString()
      };

      // Save to both JSON and CSV formats
      await DataCache.saveNVDData(formattedData, cacheConfig.filename);

      // Save as CSV for easier data handling
      const csvPath = path.join(process.cwd(), 'database', 'cisa-kev.csv');
      const csvContent = formattedData.vulnerabilities
        .map(vuln => [
          vuln.cveID,
          vuln.vendorProject,
          vuln.product,
          vuln.vulnerabilityName,
          vuln.dateAdded,
          vuln.dueDate,
          vuln.shortDescription || ''
        ].join(','))
        .join('\n');

      fs.writeFileSync(csvPath,
        'cve_id,vendor,product,name,date_added,due_date,description\n' +
        csvContent
      );

      data = formattedData;
    }

    const now = new Date();
    const stats = {
      total: data.vulnerabilities.length,
      dueSoon: data.vulnerabilities.filter((vuln: any) => {
        const daysUntilDue = Math.ceil(
          (new Date(vuln.dueDate) - now) / (1000 * 60 * 60 * 24)
        );
        return daysUntilDue <= 7;
      }).length,
      addedThisMonth: data.vulnerabilities.filter((vuln: any) => {
        const addedDate = new Date(vuln.dateAdded);
        return (
          addedDate.getMonth() === now.getMonth() &&
          addedDate.getFullYear() === now.getFullYear()
        );
      }).length,
    };

    let filteredVulnerabilities = data.vulnerabilities;
    if (due && due !== 'all') {
      filteredVulnerabilities = filteredVulnerabilities.filter((vuln: any) => {
        const daysUntilDue = Math.ceil(
          (new Date(vuln.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        if (due === 'urgent') return daysUntilDue <= 7;
        if (due === 'upcoming') return daysUntilDue > 7 && daysUntilDue <= 30;
        if (due === 'later') return daysUntilDue > 30;
        return true;
      });
    }

    // Handle pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = {
      ...data,
      vulnerabilities: filteredVulnerabilities.slice(start, end),
      pagination: {
        page,
        pageSize,
        totalPages: Math.ceil(filteredVulnerabilities.length / pageSize),
        totalItems: filteredVulnerabilities.length
      },
      stats
    };

    return NextResponse.json(paginatedData);
  } catch (error) {
    console.error('Error fetching CISA KEV data:', error);
    return NextResponse.json({
      error: 'Failed to fetch CISA KEV data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
