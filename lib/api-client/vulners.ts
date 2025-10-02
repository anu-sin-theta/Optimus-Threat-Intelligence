import { API_CONFIG, RATE_LIMITS } from './config';

export class VulnersClient {
  private headers: HeadersInit;

  constructor(apiKey: string) {
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'User-Agent': 'VulnersClient/1.0'
    };
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async searchVulnerabilities(query: string, size: number = 10, skip: number = 0) {
    const url = `${API_CONFIG.vulnersBase}search/lucene/`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ query, skip, size })
      });
      await this.sleep(RATE_LIMITS.vulners);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching vulnerabilities:', error);
      throw error;
    }
  }

  async getExploitsForCVE(cveId: string) {
    const query = `bulletinFamily:exploit AND ${cveId}`;
    return this.searchVulnerabilities(query, 20);
  }

  async getHighSeverityCVEs(days: number = 7, size: number = 50) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = `published:[${startDate.toISOString().split('T')[0]} TO ${
      endDate.toISOString().split('T')[0]
    }] AND cvss.score:[7.0 TO 10.0] AND type:cve`;

    return this.searchVulnerabilities(query, size);
  }
}
