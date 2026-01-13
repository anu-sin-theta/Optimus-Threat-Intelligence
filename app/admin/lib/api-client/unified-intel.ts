import { NVDClient } from './nvd';
import { CISAKEVClient } from './cisa';
import { RedHatSecurityClient } from './redhat';
import { VulnersClient } from './vulners';
import { ThreatFoxClient } from './threatfox';
import { AbuseIPDBClient } from './abuseIP';
import { DataCache } from '../data-cache';

export class UnifiedIntelClient {
  private nvd: NVDClient;
  private cisa: CISAKEVClient;
  private redhat: RedHatSecurityClient;
  private vulners: VulnersClient;
  private threatfox: ThreatFoxClient | undefined;
  private abuseipdb: AbuseIPDBClient;

  constructor(config: {
    nvdApiKey?: string;
    vulnersApiKey: string;
    abuseipdbApiKey: string;
    threatfoxApiKey?: string;
  }) {
    this.nvd = new NVDClient(config.nvdApiKey);
    this.cisa = new CISAKEVClient();
    this.redhat = new RedHatSecurityClient();
    this.vulners = new VulnersClient(config.vulnersApiKey);
    if (config.threatfoxApiKey) {
      this.threatfox = new ThreatFoxClient(config.threatfoxApiKey);
    }
    this.abuseipdb = new AbuseIPDBClient(config.abuseipdbApiKey);
  }

  async forceUpdateAll() {
    const updates = [];

    // Update NVD data
    updates.push(
      fetch('/api/nvd?days=7&forceUpdate=true')
        .then(res => res.json())
        .catch(err => console.error('Error updating NVD data:', err))
    );

    // Update CISA KEV data
    updates.push(
      fetch('/api/cisa?forceUpdate=true')
        .then(res => res.json())
        .catch(err => console.error('Error updating CISA KEV data:', err))
    );

    // Update Red Hat data
    updates.push(
      fetch('/api/redhat?forceUpdate=true')
        .then(res => res.json())
        .catch(err => console.error('Error updating Red Hat data:', err))
    );

    try {
      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error('Error during force update:', error);
      return false;
    }
  }

  async getComprehensiveCVEInfo(cveId: string) {
    try {
      const [nvdData, kevData, redhatData, exploits] = await Promise.all([
        this.nvd.getCVE(cveId),
        this.cisa.checkCVEInKEV(cveId),
        this.redhat.getCVEDetails(cveId),
        this.vulners.getExploitsForCVE(cveId)
      ]);

      return {
        nvd: nvdData,
        kev: kevData,
        redhat: redhatData,
        exploits: exploits,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting comprehensive CVE info:', error);
      throw error;
    }
  }

  async getRecentThreats(days: number = 7) {
    try {
      const promises = [
        this.nvd.getRecentCVEs(days),
        this.cisa.getRecentKEVAdditions(days),
        this.vulners.getHighSeverityCVEs(days),
      ];

      if (this.threatfox) {
        promises.push(this.threatfox.getRecentIOCsDays());
      }

      const [recentCVEs, recentKEV, highSeverityCVEs, maliciousIPs] = await Promise.all(promises);

      return {
        cves: recentCVEs,
        kev: recentKEV,
        highSeverity: highSeverityCVEs,
        maliciousIPs: maliciousIPs || null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting recent threats:', error);
      throw error;
    }
  }

  async checkIPReputation(ipAddress: string) {
    try {
      const promises = [this.abuseipdb.checkIP(ipAddress)];

      if (this.threatfox) {
        promises.push(this.threatfox.searchIOC(ipAddress));
      }

      const [abuseipdbData, threatfoxData] = await Promise.all(promises);

      return {
        abuseipdb: abuseipdbData,
        threatfox: threatfoxData || null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking IP reputation:', error);
      throw error;
    }
  }

  async clearAllCache() {
    try {
      const cacheFiles = [
        'nvd-recent-7days.json',
        'cisa-kev.json',
        'redhat-advisories.json'
      ];

      for (const file of cacheFiles) {
        await DataCache.clearCache(file);
      }
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }
}
