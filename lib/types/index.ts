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
