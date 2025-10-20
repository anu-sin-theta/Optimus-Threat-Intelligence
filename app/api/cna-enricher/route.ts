import { NextResponse } from 'next/server';
import { DataCache } from '@/lib/data-cache';
import fs from 'fs/promises';
import path from 'path';

// Function to log messages to a file
async function logMessage(message: string) {
  const logPath = path.join(process.cwd(), 'logs', 'cna-enricher.log');
  const logMessage = `[${new Date().toISOString()}] ${message}
`;
  try {
    await fs.appendFile(logPath, logMessage);
  } catch (e) {
    console.error('Failed to write to log file:', e);
  }
}

async function fetchCVEData(cveUrl: string) {
  try {
    await logMessage(`Fetching CVE data from: ${cveUrl}`);
    const response = await fetch(cveUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    await logMessage(`Successfully fetched CVE data from: ${cveUrl}`);
    return data;
  } catch (error) {
    await logMessage(`Failed to fetch CVE data for ${cveUrl}: ${error}`);
    return null;
  }
}

// Function to process fetches in batches
async function fetchInBatches(urls: string[], batchSize: number) {
  let results: any[] = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    const batchUrls = urls.slice(i, i + batchSize);
    await logMessage(`Processing batch ${i / batchSize + 1} of ${Math.ceil(urls.length / batchSize)}`);
    const batchPromises = batchUrls.map(url => fetchCVEData(url));
    const batchResults = await Promise.all(batchPromises);
    results = results.concat(batchResults.filter(r => r !== null));
    // Optional: wait a bit between batches to be nice to the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceUpdate = searchParams.get('forceUpdate') === 'true';

  await logMessage('CNA-Enricher route started.');

  try {
    const cacheConfig = {
      filename: 'cvelist.json',
      expiryHours: 1
    };

    if (!forceUpdate) {
      const cachedData = await DataCache.getNVDData(cacheConfig);
      if (cachedData && cachedData.vulnerabilities.length > 0) {
        await logMessage('Returning cached data.');
        return NextResponse.json(cachedData);
      }
    }

    await logMessage('Fetching deltaLog.json');
    const deltaLogResponse = await fetch('https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/deltaLog.json');
    if (!deltaLogResponse.ok) {
      throw new Error(`HTTP error fetching deltaLog: ${deltaLogResponse.status}`);
    }
    const deltaLog = await deltaLogResponse.json();
    await logMessage(`Fetched deltaLog.json`);

    let cveDetails: any[] = [];
    if (Array.isArray(deltaLog)) {
      const cveUrls = deltaLog.flatMap((delta: any) => {
        const links = [];
        if (delta.new) {
          links.push(...delta.new.map((item: any) => item.githubLink));
        }
        if (delta.updated) {
          links.push(...delta.updated.map((item: any) => item.githubLink));
        }
        return links;
      });

      await logMessage(`Found ${cveUrls.length} CVEs to fetch.`);
      cveDetails = await fetchInBatches(cveUrls, 10); // Process in batches of 10
      await logMessage(`Successfully fetched ${cveDetails.length} CVEs.`);
    }

    const dataToCache = {
      vulnerabilities: cveDetails,
      timestamp: new Date().toISOString()
    };

    await logMessage('Saving data to cache.');
    await DataCache.saveNVDData(dataToCache, cacheConfig.filename);
    await logMessage('Data saved to cache.');

    return NextResponse.json(dataToCache);
  } catch (error) {
    console.error('Error in CNA-Enricher route:', error);
    await logMessage(`Error in CNA-Enricher route: ${error}`);
    return NextResponse.json({
      error: 'Failed to fetch or process CVE data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}