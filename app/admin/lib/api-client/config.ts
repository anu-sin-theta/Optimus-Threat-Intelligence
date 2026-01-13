export const API_CONFIG = {
  nvdBase: 'https://services.nvd.nist.gov/rest/json/cves/2.0',
  cisaKev: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
  redhatBase: 'https://access.redhat.com/labs/securitydataapi/cve.json',
  vulnersBase: 'https://vulners.com/api/v3/',
  threatfoxExport: 'https://threatfox.abuse.ch/export/',
  abuseipdbBase: 'https://api.abuseipdb.com/api/v2/',
  fireholBase: 'http://iplists.firehol.org/files/',
  newsapiBase: 'https://newsapi.org/v2/'
};

export const RATE_LIMITS = {
  nvdWithKey: 600, // 0.6 seconds in ms
  nvdWithoutKey: 6000,
  vulners: 1000,
  abuseipdb: 1000,
  redhat: 1000,
  general: 1000
};
