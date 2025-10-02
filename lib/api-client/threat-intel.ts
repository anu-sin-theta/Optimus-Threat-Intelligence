import { API_CONFIG, RATE_LIMITS } from './config';

export class ThreatFoxClient {
  private headers: HeadersInit;

  constructor(apiKey?: string) {
    this.headers = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      this.headers['API-KEY'] = apiKey;
    }
  }

  async getRecentMaliciousIPs(format: 'json' | 'csv' = 'json') {
    const url = `${API_CONFIG.threatfoxExport}${format}/ip-port/recent/`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return format === 'json' ? response.json() : response.text();
    } catch (error) {
      console.error('Error fetching ThreatFox data:', error);
      throw error;
    }
  }

  async searchIOC(iocValue: string, iocType: string = 'ip') {
    const url = `${API_CONFIG.threatfoxExport}api/v1/`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query: 'search_ioc',
          search_term: iocValue
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error searching IOC:', error);
      throw error;
    }
  }
}

export class AbuseIPDBClient {
  private headers: HeadersInit;

  constructor(apiKey: string) {
    this.headers = {
      'Key': apiKey,
      'Accept': 'application/json'
    };
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkIP(ipAddress: string, maxAgeDays: number = 90) {
    const url = `${API_CONFIG.abuseipdbBase}check`;
    const params = new URLSearchParams({
      ipAddress,
      maxAgeInDays: maxAgeDays.toString(),
      verbose: ''
    });

    try {
      const response = await fetch(`${url}?${params}`, {
        headers: this.headers
      });
      await this.sleep(RATE_LIMITS.abuseipdb);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error checking IP:', error);
      throw error;
    }
  }

  async checkIPBlock(networkCIDR: string, maxAgeDays: number = 90) {
    const url = `${API_CONFIG.abuseipdbBase}check-block`;
    const params = new URLSearchParams({
      network: networkCIDR,
      maxAgeInDays: maxAgeDays.toString()
    });

    try {
      const response = await fetch(`${url}?${params}`, {
        headers: this.headers
      });
      await this.sleep(RATE_LIMITS.abuseipdb);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error checking IP block:', error);
      throw error;
    }
  }
}
