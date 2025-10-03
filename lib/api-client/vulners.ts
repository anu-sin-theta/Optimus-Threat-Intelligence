import { API_CONFIG, RATE_LIMITS } from './config';

interface VulnersSearchResponse {
  result: 'OK' | 'error';
  data: {
    documents: any[];
  };
}

export class VulnersClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async searchByLucene(query: string, skip: number = 0, size: number = 10, fields: string[] = []): Promise<any[]> {
    const url = `https://vulners.com/api/v3/search/lucene/`;
    const body = {
      query,
      skip,
      size,
      fields,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify(body),
      });

      await this.sleep(RATE_LIMITS.vulners);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.result === 'error') {
        throw new Error('Vulners API error');
      }

      return data.data.documents;
    } catch (error) {
      console.error('Error fetching Vulners data:', error);
      throw error;
    }
  }

  async getById(id: string, fields: string[] = ['*']): Promise<any> {
    const url = `https://vulners.com/api/v3/search/id/`;
    const body = {
      id,
      fields,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify(body),
      });

      await this.sleep(RATE_LIMITS.vulners);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.result === 'error') {
        throw new Error('Vulners API error');
      }

      return data.data.documents ? Object.values(data.data.documents)[0] : undefined;
    } catch (error) {
      console.error('Error fetching Vulners data:', error);
      throw error;
    }
  }

  async getByIds(ids: string[], fields: string[] = ['*']): Promise<any[]> {
    const url = `https://vulners.com/api/v3/search/id/`;
    const body = {
      id: ids,
      fields,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify(body),
      });

      await this.sleep(RATE_LIMITS.vulners);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.result === 'error') {
        throw new Error('Vulners API error');
      }

      return data.data.documents;
    } catch (error) {
      console.error('Error fetching Vulners data:', error);
      throw error;
    }
  }

  async getReferences(id: string, fields: string[] = []): Promise<any[]> {
    const url = `https://vulners.com/api/v3/search/id/`;
    const body = {
      id,
      fields,
      references: 'True',
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify(body),
      });

      await this.sleep(RATE_LIMITS.vulners);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.result === 'error') {
        throw new Error('Vulners API error');
      }

      return data.data.documents;
    } catch (error) {
      console.error('Error fetching Vulners data:', error);
      throw error;
    }
  }

  async getExploitsForSoftware(software: string, skip: number = 0, size: number = 100, fields: string[] = []): Promise<any[]> {
    const query = `bulletinFamily:exploit AND '${software}'`;
    return this.searchByLucene(query, skip, size, fields);
  }

  async getExploitsForCve(cve: string, skip: number = 0, size: number = 100, fields: string[] = []): Promise<any[]> {
    const query = `bulletinFamily:exploit AND references:${cve}`
    return this.searchByLucene(query, skip, size, fields);
  }
}