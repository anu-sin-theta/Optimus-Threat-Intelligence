import { API_CONFIG, RATE_LIMITS } from './config';

export class NVDClient {
  private headers: HeadersInit;
  private delay: number;

  constructor(apiKey?: string) {
    this.headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'CyberIntel-Platform/1.0'
    };

    if (apiKey) {
      this.headers['apiKey'] = apiKey;
      this.delay = RATE_LIMITS.nvdWithKey;
    } else {
      this.delay = RATE_LIMITS.nvdWithoutKey;
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getCVE(cveId: string) {
    const url = `${API_CONFIG.nvdBase}?cveId=${cveId}`;

    try {
      const response = await fetch(url, { headers: this.headers });
      await this.sleep(this.delay);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching CVE:', error);
      throw error;
    }
  }

  async getRecentCVEs(days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const baseUrl = `${API_CONFIG.nvdBase}?pubStartDate=${startDate.toISOString()}&pubEndDate=${endDate.toISOString()}`;
    const resultsPerPage = 2000;
    let startIndex = 0;
    let allVulnerabilities: any[] = [];
    let totalResults = 0;

    try {
      do {
        const url = `${baseUrl}&resultsPerPage=${resultsPerPage}&startIndex=${startIndex}`;
        const response = await fetch(url, { headers: this.headers });
        await this.sleep(this.delay);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (startIndex === 0) {
          totalResults = data.totalResults;
        }

        if (data.vulnerabilities) {
          allVulnerabilities = allVulnerabilities.concat(data.vulnerabilities);
        }

        startIndex += resultsPerPage;
      } while (startIndex < totalResults);

      // If no vulnerabilities found, try fetching some known critical CVEs as fallback
      if (allVulnerabilities.length === 0) {
        const knownCriticalCVEs = [
          "CVE-2023-7024",
          "CVE-2023-7035",
          "CVE-2023-7041",
          "CVE-2023-7042",
          "CVE-2023-7043"
        ];

        const cvePromises = knownCriticalCVEs.map(id => this.getCVE(id));
        const results = await Promise.all(cvePromises);

        return {
          vulnerabilities: results.flatMap(r => r.vulnerabilities || [])
        };
      }

      return { vulnerabilities: allVulnerabilities, totalResults: allVulnerabilities.length };
    } catch (error) {
      console.error('Error fetching recent CVEs:', error);
      throw error;
    }
  }
}
