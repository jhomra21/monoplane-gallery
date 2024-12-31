import { PlaneCard } from "@/components/PlaneCard";
import { useQuery } from "@tanstack/react-query";
import { searchWikiPlanes } from "@/utils/wikiApi";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: planes, isLoading } = useQuery({
    queryKey: ["planes"],
    queryFn: searchWikiPlanes,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

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
        {planes?.map((plane) => (
          <div key={plane.id} className="snap-start">
            <PlaneCard plane={plane} />
          </div>
        ))}
      </main>
    </div>
  );
};

export default Index;