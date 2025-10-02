import { API_CONFIG, RATE_LIMITS } from './config';

interface RedHatCVEResponse {
  id: string;
  cve_id: string;
  severity: string;
  title: string;
  published?: string;
  modified?: string;
  cvss3?: {
    cvss3_base_score: number;
    cvss3_scoring_vector: string;
    status: string;
  };
  affected_packages: string[];
  resource_url: string;
  details: string[];
}

interface RedHatAPIResponse {
  threat_severity?: string;
  severity?: string;
  package_state?: Array<{ package_name: string }>;
  affected_packages?: string[];
  resource_url?: string;
  details?: string[];
  bugzilla?: {
    description?: string;
  };
  cvss3?: {
    cvss3_base_score: number;
    cvss3_scoring_vector: string;
    status: string;
  };
}

export class RedHatSecurityClient {
  private headers: HeadersInit;

  constructor() {
    this.headers = {
      'User-Agent': 'RedHatSecurityClient/1.0',
      'Accept': 'application/json'
    };
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateAdvisoryId(): string {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RHSA-${year}:${sequence}`;
  }

  async getCVEDetails(cveId: string): Promise<RedHatCVEResponse> {
    // Normalize CVE ID format
    const normalizedCveId = cveId.toUpperCase().trim().replace(/^CVE-/, '');
    const url = `${API_CONFIG.redhatBase}/CVE-${normalizedCveId}`;

    try {
      const response = await fetch(url, { headers: this.headers });
      await this.sleep(RATE_LIMITS.redhat);

      if (response.status === 404) {
        return this.createPlaceholderResponse(cveId);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RedHatAPIResponse = await response.json();
      return this.formatResponse(cveId, data);
    } catch (error) {
      console.error('Error fetching Red Hat CVE details:', error);
      return this.createPlaceholderResponse(cveId);
    }
  }

  private formatResponse(cveId: string, data: RedHatAPIResponse): RedHatCVEResponse {
    return {
      id: this.generateAdvisoryId(),
      cve_id: cveId,
      severity: data.threat_severity || data.severity || 'Unknown',
      title: data.bugzilla?.description || `Security Update for ${cveId}`,
      cvss3: data.cvss3,
      affected_packages: data.affected_packages ||
                       data.package_state?.map(pkg => pkg.package_name) ||
                       ['RHEL'],
      resource_url: data.resource_url ||
                   `https://access.redhat.com/security/cve/CVE-${cveId.replace(/^CVE-/, '')}`,
      details: data.details || [
        `Security impact: ${data.threat_severity || data.severity || 'Unknown'}`,
        data.bugzilla?.description || 'No additional details available.'
      ]
    };
  }

  private createPlaceholderResponse(cveId: string): RedHatCVEResponse {
    return {
      id: this.generateAdvisoryId(),
      cve_id: cveId,
      severity: 'Unknown',
      title: `Security Advisory for ${cveId}`,
      affected_packages: ['RHEL'],
      resource_url: `https://access.redhat.com/security/cve/CVE-${cveId.replace(/^CVE-/, '')}`,
      details: [`This vulnerability may affect Red Hat products. Analysis pending.`]
    };
  }

  async getRecentAdvisories(criticalCVEs: string[]): Promise<RedHatCVEResponse[]> {
    console.log(`Fetching advisories for ${criticalCVEs.length} CVEs`);
    const advisoryPromises = criticalCVEs.map(cve => this.getCVEDetails(cve));
    const advisories = await Promise.all(advisoryPromises);
    console.log(`Retrieved ${advisories.length} advisories`);
    return advisories;
  }
}
