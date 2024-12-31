const WIKI_API_BASE = "https://en.wikipedia.org/w/api.php";

export interface PlaneInfo {
  id: number;
  name: string;
  manufacturer: string;
  firstFlight: string;
  description: string;
  imageUrl: string;
}

export const searchWikiPlanes = async (): Promise<PlaneInfo[]> => {
  // List of notable aircraft to search for
  const planeNames = [
    "Boeing 747",
    "Concorde",
    "Airbus A380",
    "Lockheed SR-71 Blackbird",
    "Supermarine Spitfire"
  ];

  const planes: PlaneInfo[] = [];

  for (const [index, planeName] of planeNames.entries()) {
    try {
      // First, get the page content
      const params = new URLSearchParams({
        origin: "*",
        action: "query",
        format: "json",
        prop: "extracts|pageimages",
        exintro: "true",
        explaintext: "true",
        titles: planeName,
        pithumbsize: "1000"
      });

      const response = await fetch(`${WIKI_API_BASE}?${params}`);
      const data = await response.json();
      const page = Object.values(data.query.pages)[0] as any;

      // Extract the first paragraph and clean it up
      const extract = page.extract || "";
      const description = extract.split("\n")[0];

      // Get manufacturer and first flight from the description
      const manufacturerMatch = description.match(/manufactured by ([^.]+)/i);
      const firstFlightMatch = description.match(/first fl[ew|ight] (?:on )?([^.]+)/i);

      planes.push({
        id: index + 1,
        name: planeName,
        manufacturer: manufacturerMatch?.[1] || "Unknown Manufacturer",
        firstFlight: firstFlightMatch?.[1] || "Date unknown",
        description: description,
        imageUrl: page.thumbnail?.source || "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2070&auto=format&fit=crop"
      });
    } catch (error) {
      console.error(`Error fetching data for ${planeName}:`, error);
    }
  }

  return planes;
};