import { NextResponse } from 'next/server';
import { DataCache } from '@/lib/data-cache';
import fs from 'fs';
import path from 'path';

interface MitreTactic {
  id: string;
  name: string;
  description: string;
}

interface MitreTechnique {
  id: string;
  name: string;
  description: string;
  tactic: string;
  platforms?: string[];
  dataSources?: string[];
  detectionName?: string;
  url?: string;
}

async function fetchMitreData(): Promise<MitreTechnique[]> {
  try {
    // Fetch Enterprise ATT&CK data
    const response = await fetch('https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const techniques: MitreTechnique[] = [];
    const tactics = new Map<string, string>();

    // First, extract all tactics
    data.objects
      .filter((obj: any) => obj.type === 'x-mitre-tactic')
      .forEach((tactic: any) => {
        tactics.set(tactic.x_mitre_shortname, tactic.name);
      });

    // Then extract techniques with their associated tactics
    data.objects
      .filter((obj: any) => obj.type === 'attack-pattern')
      .forEach((technique: any) => {
        const tacticRefs = technique.kill_chain_phases?.map((phase: any) => phase.phase_name) || [];
        const tacticNames = [...new Set(tacticRefs.map((ref: string) => tactics.get(ref)).filter(Boolean))];

        // @ts-ignore
        tacticNames.forEach((tacticName: string) => {
          techniques.push({
            id: `${technique.external_references?.[0]?.external_id}-${tacticName}`,
            name: technique.name || 'Unknown',
            description: technique.description || 'No description available',
            tactic: tacticName,
            platforms: technique.x_mitre_platforms || [],
            dataSources: technique.x_mitre_data_sources || [],
            detectionName: technique.x_mitre_detection || '',
            url: `https://attack.mitre.org/techniques/${technique.external_references?.[0]?.external_id?.replace('.', '/')}`,
          });
        });
      });

    return techniques;
  } catch (error) {

    console.error('Error fetching MITRE data:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceUpdate = searchParams.get('forceUpdate') === 'true';
  const query = searchParams.get('query');

  try {
    const cacheConfig = {
      filename: 'mitre-attack.json',
      expiryHours: 24 // MITRE data doesn't change frequently
    };

    let data = !forceUpdate ? await DataCache.getNVDData(cacheConfig) : null;

    if (!data || forceUpdate) {
      const techniques = await fetchMitreData();

      data = {
        techniques,
        timestamp: new Date().toISOString()
      };

      // Save to both JSON and CSV formats
      await DataCache.saveNVDData(data, cacheConfig.filename);

      const csvPath = path.join(process.cwd(), 'database', 'mitre-attack.csv');
      const csvContent = techniques
        .map((tech: MitreTechnique) => [
          tech.id,
          tech.name,
          tech.tactic,
          tech.description.replace(/[\n,]/g, ' '),
          tech.platforms?.join(';') || '',
          tech.dataSources?.join(';') || '',
          tech.url || ''
        ].join(','))
        .join('\n');

      fs.writeFileSync(csvPath,
        'id,name,tactic,description,platforms,data_sources,url\n' + csvContent
      );
    }

    // If there's a search query, filter the results
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      data.techniques = data.techniques.filter((tech: MitreTechnique) =>
        searchTerms.every(term =>
          tech.id.toLowerCase().includes(term) ||
          tech.name.toLowerCase().includes(term) ||
          tech.description.toLowerCase().includes(term) ||
          tech.tactic.toLowerCase().includes(term) ||
          tech.platforms?.some((p: string) => p.toLowerCase().includes(term)) ||
          tech.dataSources?.some((s: string) => s.toLowerCase().includes(term))
        )
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in MITRE ATT&CK route:', error);
    return NextResponse.json({
      error: 'Failed to fetch MITRE ATT&CK data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
