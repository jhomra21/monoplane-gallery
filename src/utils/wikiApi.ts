const WIKI_API_BASE = "https://en.wikipedia.org/w/api.php";

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
  const selected: string[] = [];
  
  while (selected.length < count && available.length > selected.length) {
    const randomIndex = Math.floor(Math.random() * available.length);
    const plane = available[randomIndex];
    if (!selected.includes(plane)) {
      selected.push(plane);
    }
  }
  
  return selected;
};

export const searchWikiPlanes = async (exclude: string[] = []): Promise<PlaneInfo[]> => {
  const planeNames = getRandomPlanes(5, exclude);
  const planes: PlaneInfo[] = [];

  for (const [index, planeName] of planeNames.entries()) {
    try {
      // First, get the exact page title to avoid redirects
      const searchParams = new URLSearchParams({
        origin: "*",
        action: "query",
        format: "json",
        list: "search",
        srsearch: `${planeName} aircraft`,
        srlimit: "1"
      });

      const searchResponse = await fetch(`${WIKI_API_BASE}?${searchParams}`);
      const searchData = await searchResponse.json();
      const exactTitle = searchData.query.search[0]?.title || planeName;

      // Then get the full page data
      const params = new URLSearchParams({
        origin: "*",
        action: "query",
        format: "json",
        prop: "extracts|pageimages|info",
        exintro: "true",
        explaintext: "true",
        inprop: "url",
        titles: exactTitle,
        pithumbsize: "1000"
      });

      const response = await fetch(`${WIKI_API_BASE}?${params}`);
      const data = await response.json();
      const page = Object.values(data.query.pages)[0] as any;

      const extract = page.extract || "";
      let description = extract.split("\n")[0];

      // Better regex patterns for manufacturer and first flight
      const manufacturerMatch = extract.match(/(?:manufactured|built|developed|designed) by ([^.,]+)/i);
      const firstFlightMatch = extract.match(/(?:first flew|first flight|maiden flight|entered service) (?:on |in )?([^.,]+)/i);

      planes.push({
        id: Date.now() + index,
        name: planeName,
        manufacturer: manufacturerMatch?.[1]?.trim() || "Unknown Manufacturer",
        firstFlight: firstFlightMatch?.[1]?.trim() || "Date unknown",
        description: description || `The ${planeName} is a notable aircraft in aviation history.`,
        imageUrl: page.thumbnail?.source || "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2070&auto=format&fit=crop"
      });
    } catch (error) {
      console.error(`Error fetching data for ${planeName}:`, error);
    }
  }

  return planes;
};