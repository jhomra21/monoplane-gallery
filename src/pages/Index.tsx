import { PlaneCard } from "@/components/PlaneCard";
import { useInfinitePlanesList, usePlanesDetails } from "@/utils/wikiApi";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { Link } from '@tanstack/react-router'
import { Bookmark } from 'lucide-react'

const PREFETCH_THRESHOLD = 2;

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollPosition = useRef(0);
  const [expandedPlanes, setExpandedPlanes] = useState<Set<string>>(new Set());

  // Get list of plane names with infinite loading
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingNames,
    isError: isNamesError,
    error: namesError,
  } = useInfinitePlanesList();

  // Get all plane names from all pages
  const planeNames = data?.pages.flat() || [];

  // Get details for each plane
  const planesQueries = usePlanesDetails(planeNames);

  // Load more trigger with better positioning
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "400px",
  });

  // Handle infinite loading
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      lastScrollPosition.current = containerRef.current?.scrollTop || 0;
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Restore scroll position after new content loads
  useEffect(() => {
    if (!isFetchingNextPage && containerRef.current) {
      containerRef.current.scrollTop = lastScrollPosition.current;
    }
  }, [isFetchingNextPage]);

  const handleToggleExpand = (planeId: string) => {
    setExpandedPlanes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planeId)) {
        newSet.delete(planeId);
      } else {
        newSet.add(planeId);
      }
      return newSet;
    });
  };

  if (isLoadingNames) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00ff00] animate-spin" />
      </div>
    );
  }

  if (isNamesError) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading planes</p>
          <p className="text-sm text-cyan-400">{namesError?.message}</p>
        </div>
      </div>
    );
  }

  const allPlanes = planesQueries
    .filter(query => query.data)
    .map(query => query.data!);
  const totalPlanes = allPlanes.length;
  const isLoadingMore = isFetchingNextPage || planesQueries.some(query => query.isLoading);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-cyan-500/20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-mono font-semibold text-[#00ff00]">
            PlaneMe
          </h1>
          <Link 
            to="/bookmarks" 
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
          >
            <Bookmark className="w-4 h-4" />
            <span className="text-sm font-mono">SYS.BOOKMARKS</span>
          </Link>
        </div>
      </header>

      <main 
        ref={containerRef}
        className="pt-16 h-screen overflow-y-auto scroll-smooth snap-y snap-mandatory"
      >
        <div className="container mx-auto px-4">
          {allPlanes.map((plane, index) => {
            const isLastPlanes = totalPlanes - index <= PREFETCH_THRESHOLD;
            const isExpanded = expandedPlanes.has(plane.id.toString());
            
            return (
              <div
                key={`${plane.id}-${index}`}
                data-plane-id={plane.id}
                className="snap-start py-8"
                style={{ 
                  height: '100vh',
                  scrollSnapAlign: 'start',
                  scrollSnapStop: 'always'
                }}
                ref={isLastPlanes ? loadMoreRef : undefined}
              >
                <div className="relative h-full flex flex-col">
                  <div 
                    className={cn(
                      "flex-1 transition-all duration-500 ease-in-out",
                      "min-h-0 relative"
                    )}
                  >
                    <PlaneCard 
                      plane={plane} 
                      isExpanded={isExpanded}
                      onToggleExpand={handleToggleExpand}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          
          {isLoadingMore && (
            <div className="h-24 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#00ff00] animate-spin" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;