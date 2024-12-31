import { PlaneCard } from "@/components/PlaneCard";

const SAMPLE_PLANES = [
  {
    id: 1,
    name: "Boeing 747",
    manufacturer: "Boeing Commercial Airplanes",
    firstFlight: "February 9, 1969",
    description: "The Boeing 747, commonly known as the 'Jumbo Jet', revolutionized air travel with its iconic hump and impressive capacity. It was the first wide-body commercial aircraft ever produced.",
    imageUrl: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Concorde",
    manufacturer: "BAC/Aérospatiale",
    firstFlight: "March 2, 1969",
    description: "The Concorde was a supersonic passenger airliner, capable of crossing the Atlantic in under 3.5 hours at twice the speed of sound. It represented a milestone in aviation technology.",
    imageUrl: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Airbus A380",
    manufacturer: "Airbus",
    firstFlight: "April 27, 2005",
    description: "The Airbus A380 is the world's largest passenger airliner. This double-deck aircraft can accommodate up to 853 passengers in a single-class configuration.",
    imageUrl: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2070&auto=format&fit=crop",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-dark">
      <header className="fixed top-0 w-full z-50 bg-dark/80 backdrop-blur-sm border-b border-primary/20">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <h1 className="text-xl font-mono font-semibold text-primary">
            PlaneFeed
          </h1>
        </div>
      </header>

      <main className="pt-16 h-screen overflow-y-auto scrollbar-hide snap-y snap-mandatory">
        {SAMPLE_PLANES.map((plane) => (
          <div key={plane.id} className="snap-start">
            <PlaneCard plane={plane} />
          </div>
        ))}
      </main>
    </div>
  );
};

export default Index;