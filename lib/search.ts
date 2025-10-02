// Types for search functionality
export interface SearchResult {
  source: string;
  data: Array<Record<string, any>>;
  timestamp: string;
}

interface SearchableFields {
  nvd: string[];
  redhat: string[];
  cisa: string[];
  mitre: string[];
}

interface SearchableItem {
  [key: string]: any;
  id?: string;
  description?: string;
}

const SEARCHABLE_FIELDS: SearchableFields = {
  nvd: ['description', 'cveId', 'vendor', 'product'],
  redhat: ['title', 'cve_id', 'affected_packages', 'details'],
  cisa: ['cveID', 'vulnerabilityName', 'vendorProject', 'product', 'shortDescription'],
  mitre: ['id', 'name', 'tactic', 'description', 'platforms']
};

const searchInObject = (obj: SearchableItem, query: string, fields: string[]): boolean => {
  const searchTerms = query.toLowerCase().split(' ');
  return searchTerms.every(term =>
    fields.some(field => {
      const value = field.split('.').reduce((o: SearchableItem | undefined, i: string) => o?.[i], obj);
      if (Array.isArray(value)) {
        return value.some((v: unknown) =>
          typeof v === 'string' && v.toLowerCase().includes(term)
        );
      }
      return typeof value === 'string' && value.toLowerCase().includes(term);
    })
  );
};

export const intelligentSearch = async (
  query: string,
  sources: Array<keyof SearchableFields>,
  forceUpdate: boolean = false
): Promise<SearchResult[]> => {
  const results: SearchResult[] = [];

  for (const source of sources) {
    try {
      // Call the search endpoint for each source
      const response = await fetch(`/api/search/${source}?query=${encodeURIComponent(query)}${forceUpdate ? '&forceUpdate=true' : ''}`);

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          results.push({
            source,
            data: data.data,
            timestamp: data.timestamp || new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error(`Error searching ${source}:`, error);
    }
  }

  return results;
};
