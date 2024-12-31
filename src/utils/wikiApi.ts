import { useQuery, useQueries, useInfiniteQuery } from '@tanstack/react-query';

const WIKI_API_BASE = "https://en.wikipedia.org/w/api.php";
const TIMEOUT_MS = 8000;

export interface PlaneInfo {
  id: number;
  name: string;
  manufacturer: string;
  firstFlight: string;
  description: string;
  imageUrl: string;
}

const AIRCRAFT_LIST = [
  "Boeing 747", "Concorde", "Airbus A380", "Lockheed SR-71 Blackbird",
  "Supermarine Spitfire", "F-22 Raptor", "P-51 Mustang", "Boeing B-17",
  "Messerschmitt Bf 109", "Airbus A320", "Boeing 737", "Lockheed C-130",
  "F-16 Fighting Falcon", "MiG-21", "Airbus A350", "Boeing 787", "F-35",
  "Antonov An-225", "DC-3", "Hawker Hurricane", "B-2 Spirit", "F-14 Tomcat",
  "A-10 Thunderbolt II", "Mitsubishi Zero", "Boeing B-52"
];

const getRandomPlanes = (count: number, exclude: string[] = []): string[] => {
  const available = AIRCRAFT_LIST.filter(plane => !exclude.includes(plane));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

interface WikiResponse {
  query: {
    pages: Record<string, {
      pageid: number;
      title: string;
      revisions?: Array<{
        slots: {
          main: {
            '*': string;
          };
        };
      }>;
      extract?: string;
      thumbnail?: {
        source: string;
      };
    }>;
    search?: Array<{
      title: string;
    }>;
  };
}

const KNOWN_MANUFACTURERS = [
  'Airbus',
  'Boeing',
  'Lockheed Martin',
  'Lockheed',
  'McDonnell Douglas',
  'Antonov',
  'Mitsubishi',
  'Supermarine',
  'Messerschmitt',
  'Hawker',
  'Douglas',
  'General Dynamics',
  'Northrop Grumman',
  'BAE Systems',
  'Sukhoi',
  'Mikoyan',
  'Dassault',
  'EADS',
  'Eurofighter',
  'Saab',
  'Sud Aviation',
  'Aérospatiale',
  'British Aircraft Corporation',
  'BAC',
  'British Aerospace',
  'de Havilland',
  'Vickers-Armstrongs',
  'Fokker',
  'Grumman',
  'Republic Aviation',
];

const cleanupText = (text: string): string => {
  return text
    .replace(/<!--.*?-->/g, '') // Remove HTML comments
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses and contents
    .replace(/\s*\[[^\]]*\]/g, '') // Remove square brackets and contents
    .replace(/\s*\{[^}]*\}/g, '') // Remove curly braces and contents
    .replace(/\s*→.*$/, '') // Remove arrows and everything after
    .replace(/\s*—.*$/, '') // Remove em dashes and everything after
    .replace(/\s*-.*$/, '') // Remove hyphens and everything after
    .replace(/\s*Field is.*$/i, '') // Remove "Field is..." text
    .replace(/\s*\|.*$/, '') // Remove pipe and everything after
    .replace(/\s*,.*$/, '') // Remove comma and everything after if it's not a known manufacturer
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

const parseWikiTemplates = (value: string): string => {
  if (!value) return 'Unknown';
  
  // Handle raw template strings (when template markers are already stripped)
  if (value.trim().startsWith('ubl')) {
    const content = value.replace(/^ubl\s*/, '');
    const items = content.split('|')
      .map(item => cleanupText(item))
      .filter(Boolean);
      
    // Try to find a known manufacturer in the items
    const validManufacturer = items.find(item => 
      KNOWN_MANUFACTURERS.some(mfr => 
        item.toLowerCase().includes(mfr.toLowerCase())
      )
    );
    return validManufacturer || items[0] || 'Unknown';
  }
  
  // First, handle nested templates by recursively processing them
  const processNestedTemplates = (template: string): string => {
    let depth = 0;
    let current = '';
    let result = '';
    
    for (let i = 0; i < template.length; i++) {
      const char = template[i];
      if (char === '{' && template[i + 1] === '{') {
        if (depth === 0) {
          result += current;
          current = '';
        }
        depth++;
        i++;
      } else if (char === '}' && template[i + 1] === '}') {
        depth--;
        i++;
        if (depth === 0) {
          // Process the content of the template
          const processed = processTemplateContent(current);
          result += processed;
          current = '';
        }
      } else {
        current += char;
      }
    }
    return result + current;
  };

  const processTemplateContent = (content: string): string => {
    // Handle specific templates
    if (content.startsWith('ubl|')) {
      const items = content.slice(4).split('|')
        .map(item => cleanupText(item))
        .filter(Boolean);
      
      // Try to find a known manufacturer in the items
      const validManufacturer = items.find(item => 
        KNOWN_MANUFACTURERS.some(mfr => 
          item.toLowerCase().includes(mfr.toLowerCase())
        )
      );
      return validManufacturer || items[0] || 'Unknown';
    }
    
    if (content.startsWith('plainlist|')) {
      return processNestedTemplates(content.slice(10));
    }
    
    return content;
  };

  // Process the entire value
  let result = processNestedTemplates(value);

  // Clean up any remaining wiki markup
  result = result
    .replace(/\[\[([^|\]]*)\|?([^\]]*)\]\]/g, (_, p1, p2) => p2 || p1)
    .replace(/<ref[^>]*?>.*?<\/ref>/g, '')
    .replace(/'''|''|\[\[|\]\]|link=|file:/gi, '')
    .replace(/<!--.*?-->/g, '');

  const cleaned = cleanupText(result);
  
  // Final verification against known manufacturers
  const manufacturer = KNOWN_MANUFACTURERS.find(mfr => 
    cleaned.toLowerCase().includes(mfr.toLowerCase())
  );
  
  return manufacturer || cleaned;
};

const parseInfoboxValue = (content: string, key: string): string | null => {
  // More flexible regex that can handle multi-line values and nested templates
  const regex = new RegExp(`\\|\\s*${key}\\s*=\\s*([^|]*(?:\\|(?!\\s*[a-zA-Z_]+\\s*=)[^|]*)*)`);
  const match = content.match(regex);
  if (!match) return null;

  return parseWikiTemplates(match[1]);
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = TIMEOUT_MS): Promise<Response> => {
  const controller = new AbortController();
  const signal = options.signal || controller.signal;
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const searchWikiArticle = async (title: string, type: 'general' | 'firstFlight' = 'general'): Promise<string> => {
  const params = new URLSearchParams({
    origin: '*',
    action: 'query',
    format: 'json',
    list: 'search',
    srlimit: '1',
  });

  if (type === 'firstFlight') {
    params.set('srsearch', `"first flight" "${title}" aircraft`);
  } else {
    params.set('srsearch', `${title} aircraft`);
  }

  const response = await fetchWithTimeout(
    `${WIKI_API_BASE}?${params}`
  );
  
  const data = await response.json() as WikiResponse;
  return data.query?.search?.[0]?.title || title;
};

// Keys for React Query
export const planeKeys = {
  all: ['planes'] as const,
  list: (exclude: string[] = []) => [...planeKeys.all, 'list', exclude] as const,
  detail: (name: string) => [...planeKeys.all, 'detail', name] as const,
  manufacturer: (name: string) => [...planeKeys.all, 'manufacturer', name] as const,
  firstFlight: (name: string) => [...planeKeys.all, 'firstFlight', name] as const,
};

// Convert to async functions without signal parameter
const getManufacturer = async (planeName: string): Promise<string> => {
  // First check if the name contains a known manufacturer
  const nameManufacturer = KNOWN_MANUFACTURERS.find(mfr => 
    planeName.toLowerCase().startsWith(mfr.toLowerCase())
  );
  if (nameManufacturer) return nameManufacturer;

  try {
    const exactTitle = await searchWikiArticle(planeName);
    const params = new URLSearchParams({
      origin: '*',
      action: 'query',
      format: 'json',
      prop: 'revisions|extracts|templates|categories|info',
      rvprop: 'content',
      rvslots: '*',
      tltemplates: 'Infobox_aircraft|Infobox_military_aircraft|Infobox_weapon',
      clcategories: 'Aircraft_manufacturers|Aerospace_companies',
      exintro: '1',
      explaintext: '1',
      titles: exactTitle,
    });

    const response = await fetchWithTimeout(`${WIKI_API_BASE}?${params}`);
    const data = await response.json() as WikiResponse;
    const page = Object.values(data.query.pages)[0];
    if (!page) throw new Error('Page not found');

    const content = page.revisions?.[0]?.slots.main['*'] || '';
    const extract = page.extract || '';

    // Enhanced text patterns for manufacturer extraction
    const textPatterns = [
      // Joint development patterns
      /jointly (?:developed|manufactured|produced) by ([^.]+?) and ([^.]+)/i,
      /joint venture between ([^.]+?) and ([^.]+)/i,
      /collaboration between ([^.]+?) and ([^.]+)/i,
      // Specific manufacturer patterns
      /(?:developed|manufactured|produced) by ((?:${KNOWN_MANUFACTURERS.join('|')})[^.,]*)/i,
      /(?:is|was) an? .+? (?:aircraft|airliner|fighter|bomber) (?:developed|manufactured|produced|built) by ([^.,]+)/i,
      // General patterns
      /(?:manufactured|built|produced|developed|designed) by ([^.,]+)/i,
      /([^.,]+?) (?:manufactured|built|produced|developed|designed)/i,
      new RegExp(`(${KNOWN_MANUFACTURERS.join('|')})`, 'i'),
      /^The ([^.,]+?) [^.,]+ is an? .+? aircraft/i,
    ];

    let manufacturers: string[] = [];

    // Try to find manufacturers in the extract first
    for (const pattern of textPatterns) {
      const match = extract.match(pattern);
      if (match) {
        // Handle patterns with two capture groups (joint development)
        if (match[2]) {
          const mfr1 = cleanupText(match[1]);
          const mfr2 = cleanupText(match[2]);
          manufacturers = [mfr1, mfr2].filter(m => 
            KNOWN_MANUFACTURERS.some(known => 
              m.toLowerCase().includes(known.toLowerCase())
            )
          );
          if (manufacturers.length > 0) break;
        } else if (match[1]) {
          const cleaned = cleanupText(match[1]);
          const knownMfr = KNOWN_MANUFACTURERS.find(mfr => 
            cleaned.toLowerCase().includes(mfr.toLowerCase())
          );
          if (knownMfr) {
            manufacturers = [knownMfr];
            break;
          }
        }
      }
    }

    // If manufacturers found, join them
    if (manufacturers.length > 0) {
      return manufacturers.join(' / ');
    }

    // Try infobox patterns if no manufacturers found in text
    const infoboxPatterns = [
      /{{Infobox military aircraft([^}]+)}}/i,
      /{{Infobox aircraft([^}]+)}}/i,
      /{{Infobox weapon([^}]+)}}/i,
      /{{Aircraft specifications([^}]+)}}/i,
      /{{Military aircraft specifications([^}]+)}}/i,
    ];

    // Try to find manufacturer in infobox
    for (const pattern of infoboxPatterns) {
      const match = content.match(pattern);
      if (match) {
        const infoboxContent = match[1];
        const manufacturerFields = [
          'manufacturer',
          'designer',
          'builder',
          'developer',
          'produced by',
          'design org',
          'prime contractor',
          'company',
          'org',
          'producer',
          'built by',
          'origin',
        ];
        
        for (const field of manufacturerFields) {
          const value = parseInfoboxValue(infoboxContent, field);
          if (value && value !== 'Unknown' && value !== 'ubl') {
            const cleaned = cleanupText(value);
            const knownMfr = KNOWN_MANUFACTURERS.find(mfr => 
              cleaned.toLowerCase().includes(mfr.toLowerCase())
            );
            if (knownMfr) {
              manufacturers = [knownMfr];
              break;
            }
            if (cleaned && cleaned !== 'ubl' && !cleaned.includes('{{')) {
              manufacturers = [cleaned];
              break;
            }
          }
        }
        if (manufacturers.length > 0) break;
      }
    }

    // If manufacturers found in infobox, join them
    if (manufacturers.length > 0) {
      return manufacturers.join(' / ');
    }

    // If still no manufacturers found, try a second API call with full text
    const fullParams = new URLSearchParams({
      origin: '*',
      action: 'query',
      format: 'json',
      prop: 'extracts',
      explaintext: '1',
      titles: exactTitle,
    });

    const fullResponse = await fetchWithTimeout(`${WIKI_API_BASE}?${fullParams}`);
    const fullData = await fullResponse.json() as WikiResponse;
    const fullPage = Object.values(fullData.query.pages)[0];
    const fullText = fullPage?.extract || '';

    // Try to find manufacturer in the full text
    const manufacturerMatch = fullText.match(
      new RegExp(`(${KNOWN_MANUFACTURERS.join('|')})[^.,]*(?:developed|manufactured|produced)`, 'i')
    );
    if (manufacturerMatch?.[1]) {
      manufacturers = [manufacturerMatch[1]];
    }

    return manufacturers.length > 0 ? manufacturers.join(' / ') : nameManufacturer || 'Unknown';
  } catch (error) {
    console.error(`Error finding manufacturer for ${planeName}:`, error);
    return nameManufacturer || 'Unknown';
  }
};

const getFirstFlight = async (planeName: string): Promise<string> => {
  try {
    // First try with specific first flight search
    const firstFlightTitle = await searchWikiArticle(planeName, 'firstFlight');
    
    // First API call with more structured data
    const params = new URLSearchParams({
      origin: '*',
      action: 'query',
      format: 'json',
      prop: 'revisions|extracts|templates|categories|info',
      rvprop: 'content',
      rvslots: '*',
      tltemplates: 'Infobox_aircraft|Infobox_military_aircraft|Infobox_weapon|Aircraft_specifications',
      clcategories: 'Aircraft_first_flights|Military_aircraft|Passenger_aircraft',
      exintro: '1',
      explaintext: '1',
      titles: firstFlightTitle,
    });

    const response = await fetchWithTimeout(`${WIKI_API_BASE}?${params}`);
    const data = await response.json() as WikiResponse;
    const page = Object.values(data.query.pages)[0];
    if (!page) throw new Error('Page not found');

    const content = page.revisions?.[0]?.slots.main['*'] || '';
    const extract = page.extract || '';

    // Try multiple infobox patterns with more variations
    const infoboxPatterns = [
      /{{Infobox military aircraft([^}]+)}}/i,
      /{{Infobox aircraft([^}]+)}}/i,
      /{{Infobox weapon([^}]+)}}/i,
      /{{Aircraft specifications([^}]+)}}/i,
      /{{Military aircraft specifications([^}]+)}}/i,
    ];

    let firstFlight: string | null = null;

    // First try to find first flight in infobox
    for (const pattern of infoboxPatterns) {
      const match = content.match(pattern);
      if (match) {
        const infoboxContent = match[1];
        // Try multiple first flight fields with variations
        const flightFields = [
          'first flight',
          'maiden flight',
          'first flew',
          'introduced',
          'maiden',
          'flight date',
          'first test flight',
          'prototype first flight',
          'service entry',
          'entered service',
        ];
        
        for (const field of flightFields) {
          const value = parseInfoboxValue(infoboxContent, field);
          if (value && value !== 'Unknown') {
            // Try to parse and format the date
            const cleaned = cleanupText(value);
            if (cleaned && !cleaned.toLowerCase().includes('unknown')) {
              try {
                // Try to parse various date formats
                const date = new Date(cleaned);
                if (!isNaN(date.getTime())) {
                  firstFlight = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  break;
                }
              } catch {
                // If date parsing fails, use the cleaned value
                firstFlight = cleaned;
                break;
              }
            }
          }
        }
        if (firstFlight) break;
      }
    }

    // If no first flight found in infobox, try text patterns
    if (!firstFlight || firstFlight === 'Unknown') {
      // Try a second API call with specific first flight search
      const searchParams = new URLSearchParams({
        origin: '*',
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: `"${planeName}" "first flight" OR "maiden flight" OR "first flew" date`,
        srlimit: '5',
      });

      const searchResponse = await fetchWithTimeout(`${WIKI_API_BASE}?${searchParams}`);
      const searchData = await searchResponse.json() as WikiResponse;
      let searchText = '';
      
      if (searchData.query?.search?.length > 0) {
        // Get full text for each search result
        for (const result of searchData.query.search) {
          const fullParams = new URLSearchParams({
            origin: '*',
            action: 'query',
            format: 'json',
            prop: 'extracts',
            explaintext: '1',
            titles: result.title,
          });

          const fullResponse = await fetchWithTimeout(`${WIKI_API_BASE}?${fullParams}`);
          const fullData = await fullResponse.json() as WikiResponse;
          const fullPage = Object.values(fullData.query.pages)[0];
          const fullText = fullPage?.extract || '';
          searchText = fullText; // Store for later use with year patterns

          const datePatterns = [
            // Specific first flight patterns with more variations
            new RegExp(`${planeName}[^.]*?first fl(?:ew|ight)[^.]*?on[^.]*?(\\d{1,2}[thsrdn]* [A-Z][a-z]+ \\d{4})`, 'i'),
            new RegExp(`${planeName}[^.]*?maiden flight[^.]*?on[^.]*?(\\d{1,2}[thsrdn]* [A-Z][a-z]+ \\d{4})`, 'i'),
            /first fl(?:ew|ight) (?:was )?(?:on )?(\d{1,2}[thsrdn]* [A-Z][a-z]+ \d{4})/i,
            /first fl(?:ew|ight) (?:was )?(?:on )?([A-Z][a-z]+ \d{1,2},? \d{4})/i,
            /maiden flight (?:was )?(?:on )?(\d{1,2}[thsrdn]* [A-Z][a-z]+ \d{4})/i,
            /maiden flight (?:was )?(?:on )?([A-Z][a-z]+ \d{1,2},? \d{4})/i,
            /(\d{1,2}[thsrdn]* [A-Z][a-z]+ \d{4})[^.]*?first flight/i,
            /([A-Z][a-z]+ \d{1,2},? \d{4})[^.]*?first flight/i,
            /first flew (?:on|in) (\d{1,2}[thsrdn]* [A-Z][a-z]+ \d{4})/i,
            /first flew (?:on|in) ([A-Z][a-z]+ \d{1,2},? \d{4})/i,
            /prototype first flew (?:on|in) (\d{1,2}[thsrdn]* [A-Z][a-z]+ \d{4})/i,
            /test flight (?:on|in) ([A-Z][a-z]+ \d{1,2},? \d{4})/i,
            // Date with ordinal numbers
            /(\d{1,2}(?:st|nd|rd|th) [A-Z][a-z]+ \d{4})[^.]*?first flight/i,
            // European date format
            /(\d{1,2} [A-Z][a-z]+ \d{4})[^.]*?first flight/i,
          ];

          for (const pattern of datePatterns) {
            const match = fullText.match(pattern);
            if (match?.[1]) {
              const cleaned = cleanupText(match[1]);
              try {
                // Try to parse and format the date
                const date = new Date(cleaned);
                if (!isNaN(date.getTime())) {
                  firstFlight = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  break;
                }
              } catch {
                // If date parsing fails, use the cleaned value
                firstFlight = cleaned;
                break;
              }
            }
          }
          if (firstFlight && firstFlight !== 'Unknown') break;
        }
      }

      // If still not found, try year-only patterns as fallback
      if (!firstFlight || firstFlight === 'Unknown') {
        const yearPatterns = [
          new RegExp(`${planeName}[^.]*?first flew[^.]*?(\\d{4})`, 'i'),
          new RegExp(`${planeName}[^.]*?entered service[^.]*?(\\d{4})`, 'i'),
          new RegExp(`${planeName}[^.]*?introduced[^.]*?(\\d{4})`, 'i'),
          /first flew in (\d{4})/i,
          /entered service in (\d{4})/i,
          /introduced in (\d{4})/i,
        ];

        for (const pattern of yearPatterns) {
          const match = searchText.match(pattern);
          if (match?.[1]) {
            firstFlight = `Year ${match[1]}`;
            break;
          }
        }
      }
    }

    // Final validation and cleanup
    if (firstFlight) {
      firstFlight = firstFlight
        .replace(/\s+/g, ' ')
        .replace(/^\s*(\d{4})\s*$/, 'Year $1') // Format year-only dates
        .trim();
    }

    return firstFlight || 'Unknown';
  } catch (error) {
    console.error(`Error finding first flight for ${planeName}:`, error);
    return 'Unknown';
  }
};

const getPlaneDetails = async (planeName: string): Promise<Partial<PlaneInfo>> => {
  try {
    const exactTitle = await searchWikiArticle(planeName);
    
    const params = new URLSearchParams({
      origin: '*',
      action: 'query',
      format: 'json',
      prop: 'extracts|pageimages',
      exintro: '1',
      explaintext: '1',
      pithumbsize: '1000',
      titles: exactTitle,
    });

    const response = await fetchWithTimeout(
      `${WIKI_API_BASE}?${params}`
    );
    
    const data = await response.json() as WikiResponse;
    const page = Object.values(data.query.pages)[0];
    if (!page) throw new Error('Page not found');

    return {
      description: page.extract?.split('\n')[0] || `The ${planeName} is a notable aircraft in aviation history.`,
      imageUrl: page.thumbnail?.source,
    };
  } catch (error) {
    console.error(`Error fetching details for ${planeName}:`, error);
    return {
      description: `Information about ${planeName} is currently unavailable.`,
      imageUrl: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2070&auto=format&fit=crop",
    };
  }
};

// React Query Hooks
export const usePlanesList = (exclude: string[] = []) => {
  return useQuery({
    queryKey: planeKeys.list(exclude),
    queryFn: () => getRandomPlanes(5, exclude),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useInfinitePlanesList = (initialExclude: string[] = []) => {
  return useInfiniteQuery({
    queryKey: [...planeKeys.all, 'infinite'],
    queryFn: ({ pageParam = [] }) => getRandomPlanes(5, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const allPlanes = allPages.flat();
      return allPlanes;
    },
    initialPageParam: initialExclude,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const usePlanesDetails = (planeNames: string[]) => {
  return useQueries({
    queries: planeNames.map(name => ({
      queryKey: planeKeys.detail(name),
      queryFn: async () => {
        const [manufacturer, firstFlight, details] = await Promise.all([
          getManufacturer(name),
          getFirstFlight(name),
          getPlaneDetails(name)
        ]);

        return {
          id: Date.now(),
          name,
          manufacturer,
          firstFlight,
          description: details.description || `The ${name} is a notable aircraft in aviation history.`,
          imageUrl: details.imageUrl || "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2070&auto=format&fit=crop",
        } as PlaneInfo;
      },
      staleTime: 1000 * 60 * 30, // Consider plane details fresh for 30 minutes
      cacheTime: 1000 * 60 * 60, // Keep in cache for 1 hour
      retry: 2,
    })),
  });
};

// Individual queries if needed
export const usePlaneManufacturer = (planeName: string) => {
  return useQuery({
    queryKey: planeKeys.manufacturer(planeName),
    queryFn: () => getManufacturer(planeName),
    staleTime: 1000 * 60 * 30,
  });
};

export const usePlaneFirstFlight = (planeName: string) => {
  return useQuery({
    queryKey: planeKeys.firstFlight(planeName),
    queryFn: () => getFirstFlight(planeName),
    staleTime: 1000 * 60 * 30,
  });
};

// Example usage in a component:
/*
const PlanesGallery = () => {
  const { data: planeNames, isLoading: isLoadingNames } = usePlanesList();
  const planesQueries = usePlanesDetails(planeNames || []);

  if (isLoadingNames) return <div>Loading planes...</div>;

  return (
    <div>
      {planesQueries.map(({ data, isLoading, error }, index) => {
        if (isLoading) return <div key={index}>Loading plane details...</div>;
        if (error) return <div key={index}>Error loading plane details</div>;
        if (!data) return null;

        return (
          <PlaneCard
            key={data.id}
            plane={data}
          />
        );
      })}
    </div>
  );
};
*/