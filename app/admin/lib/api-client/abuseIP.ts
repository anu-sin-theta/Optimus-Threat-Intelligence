import { API_CONFIG, RATE_LIMITS } from './config';

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
