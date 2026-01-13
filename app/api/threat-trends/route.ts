import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

async function getThreatTrendsData() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const data = new Map();
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(thirtyDaysAgo.getDate() + i);
    const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    data.set(dateString, { date: dateString, cves: 0, exploits: 0 });
  }

  // Process NVD files
  const nvdDirectory = path.join(process.cwd(), 'database');
  const nvdFiles = await glob(path.join(nvdDirectory, 'nvd-*.json'));

  for (const file of nvdFiles) {
    try {
      const fileContent = await fs.readFile(file, 'utf-8');
      const cveData = JSON.parse(fileContent);

      let vulnerabilities = [];
      if (cveData.vulnerabilities) {
        vulnerabilities = cveData.vulnerabilities;
      } else if (cveData.cve) {
        vulnerabilities = [{ cve: cveData.cve }];
      }

      for (const vulnerability of vulnerabilities) {
        const publishedDate = new Date(vulnerability.cve.published);
        if (publishedDate >= thirtyDaysAgo) {
          const dateString = publishedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (data.has(dateString)) {
            data.get(dateString).cves++;
          }
        }
      }
    } catch (error) {
      console.error(`Error processing NVD file ${file}:`, error);
    }
  }

  // Process CISA KEV file
  try {
    const cisaKevFiles = await glob(path.join(process.cwd(), 'database', 'cisa-kev*.json'));
    if (cisaKevFiles.length > 0) {
      // Use the most recent file if multiple exist
      const cisaKevPath = cisaKevFiles[cisaKevFiles.length - 1];
      const cisaKevContent = await fs.readFile(cisaKevPath, 'utf-8');
      const cisaKevData = JSON.parse(cisaKevContent);
      if (cisaKevData.vulnerabilities) {
        for (const vulnerability of cisaKevData.vulnerabilities) {
          const dateAdded = new Date(vulnerability.dateAdded);
          if (dateAdded >= thirtyDaysAgo) {
            const dateString = dateAdded.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (data.has(dateString)) {
              data.get(dateString).exploits++;
            }
          }
        }
      }
    } else {
      console.warn('No CISA KEV files found in database directory');
    }
  } catch (error) {
    console.error('Error processing CISA KEV file:', error);
  }

  return Array.from(data.values());
}

export async function GET() {
  const data = await getThreatTrendsData();
  return NextResponse.json(data);
}