import { PlaneCard } from "@/components/PlaneCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchWikiPlanes } from "@/utils/wikiApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const Index = () => {
  const [viewedPlanes, setViewedPlanes] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { ref: loadMoreRef, inView } = useInView();

  const { data: planes = [], isLoading } = useQuery({
    queryKey: ["planes", viewedPlanes],
    queryFn: () => searchWikiPlanes(viewedPlanes),
  });

  // Pre-fetch next batch when user reaches the 4th plane
  useEffect(() => {
    if (inView) {
      queryClient.prefetchQuery({
        queryKey: ["planes", [...viewedPlanes, ...planes.map(p => p.name)]],
        queryFn: () => searchWikiPlanes([...viewedPlanes, ...planes.map(p => p.name)]),
      });
    }
  }, [inView, planes, queryClient, viewedPlanes]);

  // Track viewed planes using Intersection Observer
  const { ref: viewRef, inView: isPlaneInView } = useInView({
    threshold: 0.5, // Trigger when 50% of the plane card is visible
  });

  // Handle plane viewed
  const handlePlaneViewed = (planeName: string) => {
    if (!viewedPlanes.includes(planeName)) {
      setViewedPlanes(prev => [...prev, planeName]);
      console.log("Viewed planes:", [...viewedPlanes, planeName]);
    }
  };

  useEffect(() => {
    if (isPlaneInView && planes.length > 0) {
      const currentPlane = planes[Math.floor(planes.length / 2)];
      handlePlaneViewed(currentPlane.name);
    }
  }, [isPlaneInView, planes]);

  if (isLoading && planes.length === 0) {
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
        {planes.map((plane, index) => (
          <div
            key={plane.id}
            className="snap-start"
            ref={index === Math.floor(planes.length / 2) ? viewRef : undefined}
          >
            <PlaneCard plane={plane} />
            {index === planes.length - 2 && (
              <div ref={loadMoreRef} className="h-1" />
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;