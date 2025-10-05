// Common Types for the application

export interface CVEData {
  id: string;
  cveId: string;
  description: string;
  cvssScore: number;
  severity: string;
  publishedDate: string;
  modifiedDate: string;
  source: string;
  inKev: boolean;
  createdAt: string;
}

export interface MaliciousIP {
  id: string;
  ipAddress: string;
  confidenceScore: number;
  abuseType: string;
  country: string;
  source: string;
  firstSeen: string;
  lastSeen: string;
  createdAt: string;
}

export interface CyberNews {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
  createdAt: string;
}

export interface APIConfig {
  nvdApiKey: string;
  vulnersApiKey: string;
  abuseipdbApiKey: string;
  newsapiKey: string;
  threatfoxApiKey: string;
}

export interface APIEndpoints {
  nvdBase: string;
  cisaKev: string;
  redhatBase: string;
  vulnersBase: string;
  threatfoxExport: string;
  abuseipdbBase: string;
  fireholBase: string;
  newsapiBase: string;
}

export interface ThreatFoxIOC {
    id: string;
    ioc: string;
    threat_type: string;
    threat_type_desc: string;
    ioc_type: string;
    ioc_type_desc: string;
    malware: string;
    malware_printable: string;
    malware_alias: string | null;
    malware_malpedia: string;
    confidence_level: number;
    first_seen: string;
    last_seen: string | null;
    reporter: string;
    reference: string | null;
    tags: string[] | null;
}

export interface ThreatFoxQueryResult {
    query_status: string;
    data: ThreatFoxIOC[];
}

export interface ThreatFoxMalware {
    malware_printable: string;
    malware_alias: string | null;
}

export interface ThreatFoxMalwareList {
    [key: string]: ThreatFoxMalware;
}

export interface ThreatFoxIOCType {
    ioc_type: string;
    fk_threat_type: string;
    description: string;
}

export interface ThreatFoxIOCTypes {
    [key: string]: ThreatFoxIOCType;
}

export interface ThreatFoxTag {
    first_seen: string;
    last_seen: string;
    color: string;
}

export interface ThreatFoxTagList {
    [key: string]: ThreatFoxTag;
}