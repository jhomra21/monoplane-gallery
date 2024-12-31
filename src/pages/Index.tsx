import { PlaneCard } from "@/components/PlaneCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchWikiPlanes } from "@/utils/wikiApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const Index = () => {
  const [viewedPlanes, setViewedPlanes] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: planes = [], isLoading, isFetching } = useQuery({
    queryKey: ["planes", viewedPlanes],
    queryFn: () => searchWikiPlanes(viewedPlanes),
    staleTime: 60000,
    keepPreviousData: true
  });

  // Load more trigger near the end
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  });

  // Pre-fetch next batch when user reaches the load more trigger
  useEffect(() => {
    if (inView && !isFetching) {
      queryClient.prefetchQuery({
        queryKey: ["planes", [...viewedPlanes, ...planes.map(p => p.name)]],
        queryFn: () => searchWikiPlanes([...viewedPlanes, ...planes.map(p => p.name)]),
      });
    }
  }, [inView, planes, queryClient, viewedPlanes, isFetching]);

  // Track viewed planes
  const { ref: viewRef, inView: isPlaneInView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

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
        {isFetching && planes.length > 0 && (
          <div className="flex justify-center p-4 snap-start">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;