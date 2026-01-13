import { API_CONFIG, RATE_LIMITS } from './config';

export class NewsAPIClient {
  private headers: HeadersInit;

  constructor(apiKey: string) {
    this.headers = {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json'
    };
  }

  async getSecurityNews() {
    const url = `${API_CONFIG.newsapiBase}everything?` + new URLSearchParams({
      q: '(cybersecurity OR "cyber security" OR "data breach" OR vulnerability OR ransomware)',
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: '20'
    });

    try {
      const response = await fetch(url, { headers: this.headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching security news:', error);
      throw error;
    }
  }

  async getTopSecurityHeadlines(country: string = 'us') {
    const url = `${API_CONFIG.newsapiBase}top-headlines?` + new URLSearchParams({
      category: 'technology',
      q: '(cybersecurity OR "cyber security" OR "data breach")',
      country,
      pageSize: '10'
    });

    try {
      const response = await fetch(url, { headers: this.headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching top headlines:', error);
      throw error;
    }
  }
}