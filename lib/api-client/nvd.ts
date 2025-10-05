import { API_CONFIG } from './config';

interface NVDError {
  message: string;
  status: number;
  isNotFound?: boolean;
}

// Assuming NVDCVEResponse is defined elsewhere, for now 'any'
type NVDCVEResponse = any;

export class NVDClient {
  private headers: HeadersInit;
  private delay: number = 2000; // 2 seconds between requests
  private timeout: number = 30000; // 30 seconds
  private maxRetries: number = 2;

  constructor(apiKey?: string) {
    this.headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'CyberIntel-Platform/1.0'
    };

    if (apiKey) {
      this.headers['apiKey'] = apiKey;
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getCVE(cveId: string) {
    const url = `${API_CONFIG.nvdBase}?cveId=${cveId}`;
    let attempt = 0;
    let response: Response | null = null;

    while (attempt < this.maxRetries && !response) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        response = await fetch(url, {
          headers: this.headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

      } catch (error: any) {
        attempt++;
        console.warn(`NVD API attempt ${attempt}/${this.maxRetries} for ${cveId} failed:`, error.message);

        if (attempt >= this.maxRetries) {
          throw new Error(`NVD API failed for ${cveId} after ${this.maxRetries} attempts: ${error.message}`);
        }

        console.log(`Retrying in ${this.delay}ms...`);
        await this.sleep(this.delay);
      }
    }

    if (!response) {
      throw new Error(`NVD API request for ${cveId} failed to get a response.`);
    }

    const data = await response.json();

    // Validate the response structure
    if (!data?.vulnerabilities?.[0]?.cve) {
      throw {
        message: `Invalid response format for CVE ${cveId}`,
        status: 500
      };
    }

    return data;
  }

  async getRecentCVEs(days: number = 7, limit: number = 2000, offset: number = 0): Promise<{ vulnerabilities: NVDCVEResponse[], totalResults: number, stats: any }> {
    const allCVEs: NVDCVEResponse[] = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const baseUrl = `${API_CONFIG.nvdBase}?lastModStartDate=${startDate.toISOString()}&lastModEndDate=${endDate.toISOString()}`;
    const resultsPerPage = 100;
    let startIndex = offset;
    let totalResults = 0;

    do {
      const url = `${baseUrl}&resultsPerPage=${resultsPerPage}&startIndex=${startIndex}`;
      
      let attempt = 0;
      let response: Response | null = null;
      
      while (attempt < this.maxRetries && !response) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.timeout);
          
          response = await fetch(url, { 
            headers: this.headers,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
        } catch (error: any) {
          attempt++;
          console.warn(`NVD API attempt ${attempt}/${this.maxRetries} failed:`, error.message);
          
          if (attempt >= this.maxRetries) {
            throw new Error(`NVD API failed after ${this.maxRetries} attempts: ${error.message}`);
          }
          
          console.log(`Retrying in ${this.delay}ms...`);
          await this.sleep(this.delay);
        }
      }

      if (response) {
        const data = await response.json();
        if (startIndex === 0) {
            totalResults = data.totalResults;
        }

        if (data.vulnerabilities) {
            allCVEs.push(...data.vulnerabilities);
        }
        startIndex += resultsPerPage;
      } else {
        // This should not happen if the retry logic throws an error.
        break;
      }
      
      await this.sleep(this.delay);
      
    } while (allCVEs.length < limit && startIndex < totalResults);

    const stats = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      UNKNOWN: 0,
    };

    allCVEs.forEach((vuln: any) => {
      const cvssData = vuln.cve.metrics?.cvssMetricV31?.[0]?.cvssData ||
                     vuln.cve.metrics?.cvssMetricV30?.[0]?.cvssData ||
                     vuln.cve.metrics?.cvssMetricV2?.[0]?.cvssData;
      const severity = cvssData?.baseSeverity || 'UNKNOWN';
      if (stats.hasOwnProperty(severity)) {
        (stats as any)[severity]++;
      }
    });

    return { vulnerabilities: allCVEs.slice(0, limit), totalResults: allCVEs.length, stats };
  }
}
