import { API_CONFIG } from './config';

export interface KEVEntry {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  notes: string;
}

export class CISAKEVClient {
  async downloadKEVCatalog() {
    try {
      const response = await fetch(API_CONFIG.cisaKev);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error downloading KEV catalog:', error);
      throw error;
    }
  }

  async getRecentKEVAdditions(days: number = 30) {
    try {
      const kevData = await this.downloadKEVCatalog();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentVulnerabilities = kevData.vulnerabilities.filter((vuln: KEVEntry) => {
        const dateAdded = new Date(vuln.dateAdded);
        return dateAdded >= cutoffDate;
      });
      return { vulnerabilities: recentVulnerabilities };
    } catch (error) {
      console.error('Error getting recent KEV additions:', error);
      throw error;
    }
  }

  async checkCVEInKEV(cveId: string): Promise<KEVEntry | null> {
    try {
      const kevData = await this.downloadKEVCatalog();
      return kevData.vulnerabilities.find(
        (vuln: KEVEntry) => vuln.cveID === cveId
      ) || null;
    } catch (error) {
      console.error('Error checking CVE in KEV:', error);
      throw error;
    }
  }
}
