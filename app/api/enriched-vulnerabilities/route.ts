import { NextResponse } from 'next/server';
import { DataCache } from '@/lib/data-cache';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

// Helper function to read data from a cache file
async function getCachedData(filename: string) {
  try {
    return await DataCache.getNVDData({ filename, expiryHours: 24 });
  } catch (error) {
    console.error(`Could not read cache file ${filename}:`, error);
    return null;
  }
}

// Helper function to read the NVD data directly
async function getNVDDataDirectly() {
  try {
    const filePath = path.join(process.cwd(), 'database', 'nvd-recent-7days.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Could not read NVD data directly:', error);
    return null;
  }
}

async function getRedhatAdvisories() {
    const advisoryFiles = await glob('database/redhat-advisories-*.json');
    const advisories = [];
    for (const file of advisoryFiles) {
        const fileContent = await fs.readFile(file, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        if (jsonData.advisories) {
            advisories.push(...jsonData.advisories);
        }
    }
    return { advisories };
}

const keywordToMitreMap = {
  "sql injection": ["T1505"],
  "improper authorization": ["T1222", "T1069", "T1548"],
  "access control": ["T1222", "T1069", "T1548"],
  "privilege escalation": ["T1068"],
  "cross-site scripting": ["T1059.005"],
  "xss": ["T1059.005"],
};


export async function GET() {
  try {
    // 1. Fetch all data sources in parallel
    const [cvelistData, nvdData, cisaKevData, mitreData, redhatData, abuseIpData] = await Promise.all([
      getCachedData('cvelist.json'),
      getNVDDataDirectly(),
      getCachedData('cisa-kev.json'),
      getCachedData('mitre-attack.json'),
      getRedhatAdvisories(),
      getCachedData('abuseipdb-blacklist-90-100.json')
    ]);

    if (!nvdData || !nvdData.vulnerabilities) {
      return NextResponse.json({ error: 'NVD data is missing or invalid.' }, { status: 500 });
    }

    // Create a map for faster lookups
    const cveMap = new Map();
    const redhatAdvisoryMap = new Map();
    const abuseIpMap = new Map();

    // 2. Process NVD data as the base
    for (const item of nvdData.vulnerabilities) {
      const cveId = item.cve.id;
      cveMap.set(cveId, { ...item.cve });
    }

    // 3. Process Red Hat data
    if (redhatData && redhatData.advisories) {
        for (const advisory of redhatData.advisories) {
            if (!redhatAdvisoryMap.has(advisory.cve_id)) {
                redhatAdvisoryMap.set(advisory.cve_id, []);
            }
            redhatAdvisoryMap.get(advisory.cve_id).push(advisory);
        }
    }

    // 4. Process AbuseIPDB data
    if (abuseIpData && abuseIpData.data) {
        for (const ip of abuseIpData.data) {
            abuseIpMap.set(ip.ipAddress, ip);
        }
    }


    // 5. Enrich with CISA KEV data
    if (cisaKevData && cisaKevData.vulnerabilities) {
      for (const kev of cisaKevData.vulnerabilities) {
        if (cveMap.has(kev.cveID)) {
          const entry = cveMap.get(kev.cveID);
          entry.isKnownExploited = true;
          entry.kevData = kev;
        }
      }
    }

    // 6. Enrich with cvelistV5 (CNA/ADP) data
    if (cvelistData && cvelistData.vulnerabilities) {
      for (const cveDetail of cvelistData.vulnerabilities) {
        const cveId = cveDetail.cveMetadata.cveId;
        if (cveMap.has(cveId)) {
          const entry = cveMap.get(cveId);
          entry.cnaContainer = cveDetail.containers.cna;
          entry.adpContainers = cveDetail.containers.adp;
        }
      }
    }

    // 7. Enrich with MITRE ATT&CK data
    const mitreTechniqueMap = new Map();
    if (mitreData && mitreData.techniques) {
      for (const technique of mitreData.techniques) {
        const techniqueId = technique.id.split('-')[0];
        if (!mitreTechniqueMap.has(techniqueId)) {
          mitreTechniqueMap.set(techniqueId, []);
        }
        mitreTechniqueMap.get(techniqueId).push(technique);
      }
    }

    for (const entry of cveMap.values()) {
      const description = entry.descriptions?.map(d => d.value).join(' ') || '';
      entry.mitreAttack = [];

      // Match by technique ID
      const mitreRegex = /T\d{4}(\.\d{3})?/g;
      const idMatches = description.match(mitreRegex);
      if (idMatches) {
        for (const match of idMatches) {
          if (mitreTechniqueMap.has(match)) {
            entry.mitreAttack.push(...mitreTechniqueMap.get(match));
          }
        }
      }

      // Match by keyword
      for (const keyword in keywordToMitreMap) {
        if (description.toLowerCase().includes(keyword)) {
          const techniqueIds = keywordToMitreMap[keyword];
          for (const techniqueId of techniqueIds) {
            if (mitreTechniqueMap.has(techniqueId)) {
              const techniques = mitreTechniqueMap.get(techniqueId);
              for (const technique of techniques) {
                if (!entry.mitreAttack.some(t => t.id === technique.id)) {
                  entry.mitreAttack.push(technique);
                }
              }
            }
          }
        }
      }

      // Enrich with Red Hat advisories
      if (redhatAdvisoryMap.has(entry.id)) {
          entry.redhatAdvisories = redhatAdvisoryMap.get(entry.id);
      }

      // Enrich with AbuseIPDB
      const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
      const ipMatches = description.match(ipRegex);
      if (ipMatches) {
          entry.abuseIpdbInfo = [];
          for (const match of ipMatches) {
              if (abuseIpMap.has(match)) {
                  entry.abuseIpdbInfo.push(abuseIpMap.get(match));
              }
          }
      }
    }

    // 8. Convert map back to an array
    const enrichedVulnerabilities = Array.from(cveMap.values());

    const response = {
      timestamp: new Date().toISOString(),
      vulnerabilityCount: enrichedVulnerabilities.length,
      vulnerabilities: enrichedVulnerabilities,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in enriched-vulnerabilities route:', error);
    return NextResponse.json({
      error: 'Failed to create enriched vulnerability data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
