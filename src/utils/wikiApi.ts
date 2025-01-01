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

export interface ExtendedPlaneInfo {
  specifications?: {
    crew?: string;
    length?: string;
    wingspan?: string;
    height?: string;
    maxSpeed?: string;
    range?: string;
    serviceLife?: string;
    armament?: string;
    capacity?: string;
    powerplant?: string;
    weight?: string;
    ceiling?: string;
    climbRate?: string;
    unitCost?: string;
    status?: string;
    primaryUsers?: string;
    produced?: string;
    number_built?: string;
  };
  history?: string[];
  variants?: string[];
}

const AIRCRAFT_LIST = [
  "Boeing 747", "Concorde", "Airbus A380", "Lockheed SR-71 Blackbird",
  "Supermarine Spitfire", "F-22 Raptor", "P-51 Mustang", "Boeing B-17",
  "Messerschmitt Bf 109", "Airbus A320", "Boeing 737", "Lockheed C-130",
  "F-16 Fighting Falcon", "MiG-21", "Airbus A350", "Boeing 787", "F-35",
  "Antonov An-225", "DC-3", "Hawker Hurricane", "B-2 Spirit", "F-14 Tomcat",
  "A-10 Thunderbolt II", "Mitsubishi Zero", "Boeing B-52",
  "Lockheed P-38 Lightning", "Focke-Wulf Fw 190", "Junkers Ju 87 Stuka",
  "Boeing 777", "Airbus A330", "Embraer E190", "Bombardier CRJ-900",
  "MiG-29", "Su-27 Flanker", "F-4 Phantom II", "F-86 Sabre",
  "Northrop F-5", "Dassault Rafale", "Eurofighter Typhoon", "Saab JAS 39 Gripen",
  "Lockheed Martin F-117 Nighthawk", "Grumman F6F Hellcat", "Vought F4U Corsair",
  "Republic P-47 Thunderbolt", "de Havilland Mosquito", "Avro Lancaster",
  "Boeing 707", "McDonnell Douglas DC-10", "Lockheed L-1011 TriStar",
  "Tupolev Tu-144", "Ilyushin Il-96", "Antonov An-124",
  "Airbus A400M Atlas", "Lockheed P-3 Orion", "Boeing E-3 Sentry",
  "Grumman E-2 Hawkeye", "Lockheed U-2", "Northrop Grumman B-21 Raider",
  "Dassault Mirage III", "English Electric Lightning", "Hawker Hunter",
  "Panavia Tornado", "SEPECAT Jaguar", "Yakovlev Yak-3",
  "Lavochkin La-5", "Ilyushin Il-2 Sturmovik", "Polikarpov I-16",
  "Curtiss P-40 Warhawk", "Bell P-39 Airacobra", "Grumman TBF Avenger",
  "Douglas SBD Dauntless", "Consolidated B-24 Liberator", "Boeing B-29 Superfortress",
  "Handley Page Halifax", "Short Stirling", "Bristol Beaufighter",
  "Gloster Meteor", "de Havilland Vampire", "Saab 35 Draken",
  "Dassault Mirage 2000", "Sukhoi Su-57", "Chengdu J-20",
  "Shenyang J-31", "HAL Tejas", "KAI T-50 Golden Eagle",
  "Mitsubishi F-2", "Kawasaki C-2", "Embraer KC-390",
  "Airbus A220", "Boeing 757", "McDonnell Douglas MD-80",
  "Fokker 100", "BAe 146", "Saab 340",
  "ATR 72", "Dash 8", "Cessna Citation X",
  "Gulfstream G650", "Bombardier Global 7500", "Pilatus PC-24",
  "Antonov An-72", "Beriev Be-200", "Tupolev Tu-95",
  "Northrop YB-49", "Convair B-36 Peacemaker", "Martin B-26 Marauder",
  "Douglas A-26 Invader", "Northrop P-61 Black Widow", "Lockheed P-80 Shooting Star",
  "Republic F-84 Thunderjet", "North American F-100 Super Sabre", "Convair F-102 Delta Dagger",
  "Lockheed F-104 Starfighter", "Grumman A-6 Intruder", "McDonnell Douglas F-15 Eagle",
  "Northrop F-20 Tigershark", "General Dynamics F-111", "Rockwell B-1 Lancer",
  "Sukhoi Su-25", "Mikoyan MiG-31", "Yakovlev Yak-141",
  "Dassault Mystère", "Saab 37 Viggen", "CAC Boomerang",
  "Mitsubishi A6M Zero", "Kawanishi N1K", "Nakajima Ki-84",
  "Heinkel He 111", "Dornier Do 17", "Junkers Ju 88",
  "Tupolev Tu-160", "Sukhoi Su-35", "Boeing 767"
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
  if (!text) return '';
  
  return text
    // Remove references
    .replace(/<ref[^>]*?>.*?<\/ref>/gs, '')
    .replace(/<ref[^>]*?\/>/g, '')
    .replace(/<ref[^>]*?>/g, '')
    
    // Remove citation templates
    .replace(/\{\{cite[^}]*\}\}/gi, '')
    .replace(/\{\{citation[^}]*\}\}/gi, '')
    
    // Remove HTML comments
    .replace(/<!--.*?-->/g, '')
    
    // Remove parameter assignments but keep the value if it's a measurement
    .replace(/\|(?!(?:\d+(?:\.\d+)?(?:\s*(?:m|ft|in|kg|lb|km|mi|nmi|km\/h|mph|kn))?(?:\s*(?:–|-)\s*\d+(?:\.\d+)?(?:\s*(?:m|ft|in|kg|lb|km|mi|nmi|km\/h|mph|kn))?)?))[^|=]*=[^|]*/g, '')
    
    // Remove various brackets and their contents
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s*\{[^}]*\}/g, '')
    
    // Remove various separators and their trailing content
    .replace(/\s*→.*$/, '')
    .replace(/\s*—.*$/, '')
    .replace(/\s*-(?![\d\s])/g, '') // Keep hyphens in numbers
    .replace(/\s*Field is.*$/i, '')
    
    // Remove templates
    .replace(/\{\{convert\|(\d+(?:\.\d+)?)\|([^|}]+)[^}]*\}\}/g, '$1 $2')
    .replace(/\{\{cvt\|(\d+(?:\.\d+)?)\|([^|}]+)[^}]*\}\}/g, '$1 $2')
    
    // Clean up remaining artifacts
    .replace(/\*\*/g, '')
    .replace(/\|\s*$/g, '')
    .replace(/^\s*\|/, '')
    .replace(/\s+/g, ' ')
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
  const regex = new RegExp(`\\|\\s*${key}\\s*=\\s*([^|]*(?:\\|(?!\\s*[a-zA-Z_]+\\s*=)[^|]*)*)`);
  const match = content.match(regex);
  if (!match) return null;

  let value = match[1];

  // Handle production dates
  if (key === 'produced') {
    const dateMatch = value.match(/(\d{4})(?:\s*[-–]\s*(\d{4}|\w+))?/);
    if (dateMatch) {
      const [_, startYear, endYear] = dateMatch;
      return endYear ? `${startYear}–${endYear}` : startYear;
    }
  }

  // Handle number built
  if (key === 'number built') {
    const numberMatch = value.match(/(\d+(?:,\d+)*)/);
    if (numberMatch) {
      return numberMatch[1].replace(/,/g, ',') + ' units';
    }
  }

  // Handle unit cost with currency
  if (key === 'unit cost') {
    const costMatch = value.match(/(?:US)?\$?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:million|billion|M|B)?/i);
    if (costMatch) {
      let [_, amount] = costMatch;
      amount = amount.replace(/,/g, ',');
      if (value.toLowerCase().includes('million')) {
        return `$${amount}M`;
      } else if (value.toLowerCase().includes('billion')) {
        return `$${amount}B`;
      }
      return `$${amount}`;
    }
  }

  // Handle capacity with better passenger/cargo parsing
  if (key === 'capacity') {
    // Handle passenger capacity with ranges
    const passengerMatch = value.match(/(\d+)(?:\s*[-–]\s*(\d+))?\s*(?:typical|max)?\s*passengers?/i);
    if (passengerMatch) {
      const [_, min, max] = passengerMatch;
      return max ? `${min}–${max} passengers` : `${min} passengers`;
    }
    
    // Handle cargo capacity
    const cargoMatch = value.match(/(\d+(?:,\d+)?)\s*(?:kg|lb|tons?)/i);
    if (cargoMatch) {
      return cargoMatch[0];
    }
  }

  // Handle measurements with unit conversion
  const measurementMatch = value.match(/(\d+(?:\.\d+)?)\s*(?:m|ft|in|kg|lb|km|mi|nmi|km\/h|mph|kn)/);
  if (measurementMatch) {
    return measurementMatch[0];
  }

  // Clean up the value
  const cleaned = cleanupText(value);
  
  // Return null if the cleaned value is empty or contains only special characters
  if (!cleaned || /^[|=\s*]+$/.test(cleaned)) return null;
  
  return cleaned;
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
      
      if (searchData.query?.search?.length && searchData.query.search.length > 0) {
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

const getExtendedPlaneInfo = async (planeName: string): Promise<ExtendedPlaneInfo> => {
  // First, get the correct title (handle redirects)
  const searchTitle = await searchWikiArticle(planeName);
  
  const params = new URLSearchParams({
    origin: '*',
    action: 'query',
    format: 'json',
    prop: 'revisions|extracts',
    rvprop: 'content',
    rvslots: '*',
    exintro: '0',
    explaintext: '1',
    titles: searchTitle
  });

  const response = await fetchWithTimeout(`${WIKI_API_BASE}?${params}`);
  const data = await response.json() as WikiResponse;
  const page = Object.values(data.query.pages)[0];
  const content = page.revisions?.[0]?.slots.main['*'] || '';
  const extract = page.extract || '';

  // Parse specifications from infobox with more fields
  const specifications = {
    crew: parseInfoboxValue(content, 'crew'),
    length: parseInfoboxValue(content, 'length'),
    wingspan: parseInfoboxValue(content, 'wingspan'),
    height: parseInfoboxValue(content, 'height'),
    maxSpeed: parseInfoboxValue(content, 'maxspeed'),
    range: parseInfoboxValue(content, 'range'),
    serviceLife: parseInfoboxValue(content, 'service'),
    // Additional specifications
    armament: parseInfoboxValue(content, 'armament'),
    capacity: parseInfoboxValue(content, 'capacity'),
    powerplant: parseInfoboxValue(content, 'engine'),
    weight: parseInfoboxValue(content, 'weight'),
    ceiling: parseInfoboxValue(content, 'ceiling'),
    climbRate: parseInfoboxValue(content, 'climb rate'),
    unitCost: parseInfoboxValue(content, 'unit cost'),
    status: parseInfoboxValue(content, 'status'),
    primaryUsers: parseInfoboxValue(content, 'primary user'),
    produced: parseInfoboxValue(content, 'produced'),
    number_built: parseInfoboxValue(content, 'number built')
  };

  // Extract history sections with more context
  const sections = [
    'History',
    'Development',
    'Design',
    'Operational history',
    'Background',
    'Origins',
    'Combat history',
    'Service history',
    'Notable incidents'
  ];
  
  const sectionPattern = new RegExp(
    `(?:${sections.join('|')})[\s\S]*?(?=\\n\\n[A-Z]|\\n*$)`,
    'gi'
  );
  
  const historyMatches = extract.match(sectionPattern);
  const history = historyMatches
    ?.map(section => section.trim())
    .filter(section => section.length > 100) || [];

  // Extract variants with better formatting
  const variantsMatch = content.match(/==\s*Variants\s*==\s*([\s\S]*?)(?=\n\n==|$)/i);
  const variants = variantsMatch?.[1]
    ?.split('\n*')
    .map(variant => cleanupText(variant))
    .filter(variant => variant.length > 10) || [];

  return {
    specifications: Object.fromEntries(
      Object.entries(specifications)
        .filter(([_, value]) => value !== null)
    ) as ExtendedPlaneInfo['specifications'],
    history: history.slice(0, 5), // Increased to 5 most relevant history sections
    variants: variants.slice(0, 8) // Increased to 8 most significant variants
  };
};

export const useExtendedPlaneInfo = (planeName: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...planeKeys.all, 'extended', planeName],
    queryFn: () => getExtendedPlaneInfo(planeName),
    enabled: options?.enabled && !!planeName,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
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