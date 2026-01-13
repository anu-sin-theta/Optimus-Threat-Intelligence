# API Data Documentation

This document provides a detailed overview of the APIs used in the Optimus-Threat-Intelligence application. It covers the API endpoints, the data they provide, and how that data is consumed by the frontend.

## API Endpoints

This section lists all the API endpoints and provides details about each one.

---

### 1. NVD (National Vulnerability Database)

*   **API Endpoint**: `/api/nvd`
*   **File**: `app/api/nvd/route.ts`
*   **External API**: NVD API
*   **External API URL**: `https://services.nvd.nist.gov/rest/json/cves/2.0`
*   **Description**: This endpoint fetches vulnerability data from the National Vulnerability Database.
*   **Data Format**:
    *   The endpoint returns a JSON object with a `vulnerabilities` array. Each object in the array represents a single CVE.
    *   The structure of the CVE data is based on the NVD API response, but it is processed by the `NVDClient` to include a `processedData` object with key fields like `description`, `severity`, `score`, `vector`, `vendor`, and `product`.
*   **Frontend Usage**:
    *   The `vulnerabilities-tab.jsx` component fetches a list of recent vulnerabilities from `/api/nvd?days=7` and displays them in a table.
    *   The `app/nvd/[id]/page.tsx` component fetches details for a specific CVE from `/api/nvd/[id]` and displays them on the vulnerability details page.

---

### 2. CISA KEV (Known Exploited Vulnerabilities)

*   **API Endpoint**: `/api/cisa`
*   **File**: `app/api/cisa/route.ts`
*   **External API**: CISA KEV Catalog
*   **External API URL**: `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`
*   **Description**: This endpoint fetches data from the CISA Known Exploited Vulnerabilities (KEV) catalog.
*   **Data Format**:
    *   The endpoint returns a JSON object with a `vulnerabilities` array. Each object in the array represents a single KEV entry.
    *   The structure of the KEV entry is defined by the `KEVEntry` interface in `lib/api-client/cisa.ts`.
*   **Frontend Usage**:
    *   The `cisa-kev-tab.jsx` component fetches the KEV catalog from `/api/cisa` and displays the vulnerabilities in a table.

---

### 3. Red Hat Security Data API

*   **API Endpoint**: `/api/redhat`
*   **File**: `app/api/redhat/route.ts`
*   **External API**: Red Hat Security Data API
*   **External API URL**: `https://access.redhat.com/labs/securitydataapi/cve.json`
*   **Description**: This endpoint fetches CVE details and advisories from the Red Hat Security Data API.
*   **Data Format**:
    *   The endpoint returns a JSON object representing a Red Hat advisory. The structure is defined by the `RedHatCVEResponse` interface in `lib/api-client/redhat.ts`.
*   **Frontend Usage**:
    *   The `redhat-tab.jsx` component fetches Red Hat advisories from `/api/redhat` and displays them in a table.

---

### 4. ThreatFox

*   **API Endpoint**: `/api/threatfox`
*   **File**: `app/api/threatfox/route.ts` and other files in `app/api/threatfox`
*   **External API**: ThreatFox API
*   **External API URL**: `https://threatfox-api.abuse.ch/api/v1/`
*   **Description**: This endpoint interacts with the ThreatFox API to get information about Indicators of Compromise (IOCs).
*   **Data Format**:
    *   The data format varies depending on the specific ThreatFox query. The types are defined in `lib/types/index.ts`.
*   **Frontend Usage**:
    *   The `malicious-ips-tab.jsx` component uses the `threatfox` client to fetch and display malicious IPs.

---

### 5. AbuseIPDB

*   **API Endpoint**: `/api/abuseipdb`
*   **File**: `app/api/abuseipdb/route.ts`
*   **External API**: AbuseIPDB API
*   **External API URL**: `https://api.abuseipdb.com/api/v2/`
*   **Description**: This endpoint interacts with the AbuseIPDB API to check IP addresses and IP blocks for malicious activity.
*   **Data Format**:
    *   The data format is based on the AbuseIPDB API response.
*   **Frontend Usage**:
    *   The `opti-abused-tab.jsx` component uses the `abuseipdb` client to check IP reputation.

---

### 6. News API

*   **API Endpoint**: `/api/news`
*   **File**: `app/api/news/route.ts`
*   **External API**: NewsAPI
*   **External API URL**: `https://newsapi.org/v2/`
*   **Description**: This endpoint fetches security news from the NewsAPI.
*   **Data Format**:
    *   The data format is based on the NewsAPI response.
*   **Frontend Usage**:
    *   The `cyber-news-tab.jsx` component fetches and displays security news articles.

---

### 7. CWE (Common Weakness Enumeration)

*   **API Endpoint**: `/api/cwe/[id]`
*   **File**: `app/api/cwe/[id]/route.ts`
*   **External API**: N/A (reads from local JSON file)
*   **External API URL**: N/A (reads from local JSON file)
*   **Description**: This endpoint fetches details for a specific Common Weakness Enumeration (CWE).
*   **Data Format**:
    *   The endpoint returns a JSON object with a `Weaknesses` array.
*   **Frontend Usage**:
    *   The `app/nvd/[id]/page.tsx` component fetches CWE details from `/api/cwe/[id]` when a user clicks on a CWE ID.