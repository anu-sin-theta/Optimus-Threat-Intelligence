import { ThreatFoxQueryResult, ThreatFoxMalwareList, ThreatFoxIOCTypes, ThreatFoxTagList } from '../../types';

const THREATFOX_API_BASE_URL = 'https://threatfox-api.abuse.ch/api/v1/';

export class ThreatFoxClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async postRequest(body: object): Promise<any> {
    const response = await fetch(THREATFOX_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Auth-Key': this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Error making ThreatFox request: ${response.statusText}`);
    }

    return response.json();
  }

  async getRecentIOCsDays(days: number = 1): Promise<ThreatFoxQueryResult> {
    return this.postRequest({ query: 'get_iocs', days });
  }

  async searchIOC(ioc: string): Promise<ThreatFoxQueryResult> {
    return this.postRequest({ query: 'search_ioc', search_term: ioc });
  }

  async getIOCById(id: string): Promise<ThreatFoxQueryResult> {
    return this.postRequest({ query: 'ioc', id });
  }

  async searchIOCByHash(hash: string): Promise<ThreatFoxQueryResult> {
    return this.postRequest({ query: 'search_hash', hash });
  }

  async getTagInfo(tag: string, limit: number = 100): Promise<ThreatFoxQueryResult> {
    return this.postRequest({ query: 'taginfo', tag, limit });
  }

  async getMalwareInfo(malware: string, limit: number = 100): Promise<ThreatFoxQueryResult> {
    return this.postRequest({ query: 'malwareinfo', malware, limit });
  }

  async getMalwareList(): Promise<ThreatFoxMalwareList> {
    return this.postRequest({ query: 'malware_list' });
  }

  async getIOCTypes(): Promise<ThreatFoxIOCTypes> {
    return this.postRequest({ query: 'types' });
  }

  async getTagList(): Promise<ThreatFoxTagList> {
    return this.postRequest({ query: 'tag_list' });
  }

  async getLabel(malware: string, platform?: string): Promise<any> {
    return this.postRequest({ query: 'get_label', malware, platform });
  }
}
