import { Maximize2, X, ExternalLink, ChevronDown, ChevronUp, Info, Plane, Calendar, Shield, Bookmark, Ruler, Users, Gauge, Route, Crosshair, DollarSign, Scale, Zap, Users2 } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toggleBookmark, bookmarkStore } from "@/stores/bookmarkStore";
import { useStore } from "@tanstack/react-store";
import { useExtendedPlaneInfo } from "@/utils/wikiApi";
import { Skeleton } from "@/components/ui/skeleton";

interface PlaneCardProps {
  plane: {
    id: number;
    name: string;
    manufacturer: string;
    firstFlight: string;
    description: string;
    imageUrl: string;
  };
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
}

const getWikipediaUrl = (planeName: string) => {
  const searchTerm = planeName.replace(/\s+/g, '_');
  return `https://en.wikipedia.org/wiki/${searchTerm}`;
};

export const PlaneCard = ({ plane, isExpanded = false, onToggleExpand }: PlaneCardProps) => {
  const [isBookmarkAnimating, setIsBookmarkAnimating] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { data: extendedInfo, isLoading: isLoadingExtended } = useExtendedPlaneInfo(
    plane.name,
    {
      enabled: isExpanded
    }
  );
  
  const isBookmarked = useStore(
    bookmarkStore,
    useCallback((state) => state.bookmarkedPlanes.has(plane.id), [plane.id])
  );

  const handleBookmarkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarkAnimating(true);
    toggleBookmark({
      id: plane.id,
      name: plane.name,
      manufacturer: plane.manufacturer,
      firstFlight: plane.firstFlight,
      imageUrl: plane.imageUrl
    });
  }, [plane]);

  // Handle bookmark animation
  useEffect(() => {
    if (isBookmarkAnimating) {
      const timer = setTimeout(() => {
        setIsBookmarkAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isBookmarkAnimating]);

  const handleToggleExpand = useCallback(() => {
    onToggleExpand?.(plane.id.toString());
  }, [plane.id, onToggleExpand]);

  const openFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClosing(false);
    setIsImageFullscreen(true);
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsImageFullscreen(false);
      setIsClosing(false);
    }, 300);
  }, []);

  const renderSpecifications = () => {
    if (!isExpanded) return null;

    if (isLoadingExtended) {
      return (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-cyan-500/10 rounded w-3/4" />
          <div className="h-4 bg-cyan-500/10 rounded w-1/2" />
          <div className="h-4 bg-cyan-500/10 rounded w-2/3" />
        </div>
      );
    }

    if (!extendedInfo?.specifications) return null;

    const specs = extendedInfo.specifications;
    return (
      <div className="grid grid-cols-2 gap-4 font-mono text-sm mt-6">
        {/* Basic Info */}
        {specs.crew && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-cyan-400 uppercase tracking-wider">Crew</p>
            </div>
            <p className="text-[#00ff00] pl-6">{specs.crew}</p>
          </div>
        )}
        
        {/* Dimensions */}
        {(specs.length || specs.wingspan || specs.height || specs.weight) && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-cyan-400 uppercase tracking-wider">Dimensions</p>
            </div>
            <div className="text-[#00ff00] pl-6 space-y-0.5">
              {specs.length && <p>Length: {specs.length}</p>}
              {specs.wingspan && <p>Wingspan: {specs.wingspan}</p>}
              {specs.height && <p>Height: {specs.height}</p>}
              {specs.weight && <p>Weight: {specs.weight}</p>}
            </div>
          </div>
        )}

        {/* Performance */}
        {(specs.maxSpeed || specs.ceiling || specs.climbRate) && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-cyan-400 uppercase tracking-wider">Performance</p>
            </div>
            <div className="text-[#00ff00] pl-6 space-y-0.5">
              {specs.maxSpeed && <p>Max Speed: {specs.maxSpeed}</p>}
              {specs.ceiling && <p>Service Ceiling: {specs.ceiling}</p>}
              {specs.climbRate && <p>Climb Rate: {specs.climbRate}</p>}
            </div>
          </div>
        )}

        {/* Range & Capacity */}
        {(specs.range || specs.capacity) && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-cyan-400 uppercase tracking-wider">Range & Capacity</p>
            </div>
            <div className="text-[#00ff00] pl-6 space-y-0.5">
              {specs.range && <p>Range: {specs.range}</p>}
              {specs.capacity && <p>Capacity: {specs.capacity}</p>}
            </div>
          </div>
        )}

        {/* Armament */}
        {specs.armament && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-cyan-400 uppercase tracking-wider">Armament</p>
            </div>
            <p className="text-[#00ff00] pl-6">{specs.armament}</p>
          </div>
        )}

        {/* Powerplant */}
        {specs.powerplant && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-cyan-400 uppercase tracking-wider">Powerplant</p>
            </div>
            <p className="text-[#00ff00] pl-6">{specs.powerplant}</p>
          </div>
        )}

        {/* Production Info */}
        {(specs.produced || specs.number_built || specs.unitCost) && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-cyan-400 uppercase tracking-wider">Production</p>
            </div>
            <div className="text-[#00ff00] pl-6 space-y-0.5">
              {specs.produced && <p>Production: {specs.produced}</p>}
              {specs.number_built && <p>Units Built: {specs.number_built}</p>}
              {specs.unitCost && <p>Unit Cost: {specs.unitCost}</p>}
            </div>
          </div>
        )}

        {/* Users */}
        {specs.primaryUsers && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-cyan-400 uppercase tracking-wider">Primary Users</p>
            </div>
            <p className="text-[#00ff00] pl-6">{specs.primaryUsers}</p>
          </div>
        )}
      </div>
    );
  };

  const renderHistory = () => {
    if (!isExpanded) return null;

    if (isLoadingExtended) {
      return (
        <div className="space-y-4 animate-pulse mt-6">
          <div className="h-4 bg-cyan-500/10 rounded w-full" />
          <div className="h-4 bg-cyan-500/10 rounded w-full" />
          <div className="h-4 bg-cyan-500/10 rounded w-3/4" />
        </div>
      );
    }

    if (!extendedInfo?.history?.length) return null;

    return (
      <div className="mt-6 font-mono">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
          <p className="text-cyan-400 uppercase tracking-wider text-sm">History</p>
        </div>
        <div className="space-y-4 text-sm text-cyan-100 pl-6">
          {extendedInfo.history.map((section, index) => (
            <p key={index}>{section}</p>
          ))}
        </div>
      </div>
    );
  };

  // Handle visibility changes
  useEffect(() => {
    if (!cardRef.current || !onToggleExpand) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && isExpanded) {
            onToggleExpand(plane.id.toString());
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% or less is visible
        rootMargin: "-10% 0px" // Add some margin to trigger slightly before the card is fully out of view
      }
    );

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isExpanded, onToggleExpand, plane.id]);

  return (
    <>
      <div 
        ref={cardRef}
        className={cn(
          "absolute inset-0 overflow-hidden",
          "transition-all duration-500 ease-in-out bg-[#0a0a0a]",
          "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.03),transparent_70%)]"
        )}
      >
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-500/40 z-10" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-500/40 z-10" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-500/40 z-10" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-500/40 z-10" />

        {/* Main Image */}
        <div className="absolute inset-0">
          <img
            src={plane.imageUrl}
            alt={plane.name}
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              "transition-all duration-500 ease-in-out transform",
              isExpanded ? "scale-105 brightness-75" : "scale-100 brightness-90",
              "hover:brightness-110"
            )}
          />
        </div>

        {/* Info Overlay */}
        <div className={cn(
          "absolute inset-x-0 bottom-0",
          "bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-cyan-500/20",
          "transition-all duration-500 ease-in-out",
          isExpanded ? "h-[85%]" : "h-[35%]"
        )}>
          {/* Decorative lines */}
          <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-[#0a0a0a]/95 to-transparent" />
          <div className="absolute -top-[1px] left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0" />
          
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-cyan-500/20 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-start">
                <div className="relative inline-flex flex-col group">
                  {/* Targeting corners - they will resize with the content */}
                  <div className="absolute -top-3 -left-3 w-4 h-4 border-l-2 border-t-2 border-[#00ff00]/60 group-hover:border-[#00ff00]" />
                  <div className="absolute -top-3 -right-3 w-4 h-4 border-r-2 border-t-2 border-[#00ff00]/60 group-hover:border-[#00ff00]" />
                  <div className="absolute -bottom-3 -left-3 w-4 h-4 border-l-2 border-b-2 border-[#00ff00]/60 group-hover:border-[#00ff00]" />
                  <div className="absolute -bottom-3 -right-3 w-4 h-4 border-r-2 border-b-2 border-[#00ff00]/60 group-hover:border-[#00ff00]" />
                  
                  <h2 className="font-mono text-2xl font-bold tracking-tight text-white group-hover:text-[#00ff00] px-4 pt-2">
                    <a 
                      href={getWikipediaUrl(plane.name)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-block"
                    >
                      {plane.name}
                    </a>
                  </h2>
                  <div className="flex items-center gap-4 px-4 pb-2 text-xs font-mono">
                    <span className="text-cyan-400">SYS.ID: {plane.id.toString().padStart(4, '0')}</span>
                    <span className="text-yellow-400">SYS.STATUS: <span className="text-[#00ff00]">ACTIVE</span></span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openFullscreen}
                  className="h-6 px-2 bg-[#0a0a0a]/50 hover:bg-[#0a0a0a]/70 text-cyan-400 rounded-none flex items-center gap-1"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono">VIEW</span>
                </Button>
                <a
                  href={getWikipediaUrl(plane.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-6 px-2 inline-flex items-center gap-1 bg-[#0a0a0a]/50 hover:bg-[#0a0a0a]/70 text-cyan-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono">WIKI</span>
                </a>
                <button
                  onClick={handleBookmarkClick}
                  className={cn(
                    "h-6 px-2 group flex items-center gap-1 bg-[#0a0a0a]/50 hover:bg-[#0a0a0a]/70",
                    "transition-all duration-500",
                    isBookmarkAnimating && "animate-bookmark"
                  )}
                >
                  <Bookmark 
                    className={cn(
                      "w-3.5 h-3.5 transition-all duration-300",
                      isBookmarked ? (
                        "fill-yellow-400 text-yellow-400 group-hover:text-yellow-300 group-hover:fill-yellow-300"
                      ) : (
                        "text-cyan-400 group-hover:text-cyan-300"
                      ),
                      isBookmarkAnimating && "scale-150"
                    )} 
                  />
                  <span className={cn(
                    "text-xs font-mono transition-all duration-300",
                    isBookmarked ? (
                      "text-yellow-400 group-hover:text-yellow-300"
                    ) : (
                      "text-cyan-400 group-hover:text-cyan-300"
                    )
                  )}>
                    {isBookmarked ? 'SAVED' : 'SAVE'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto h-[calc(100%-8rem)] pb-20 custom-scrollbar">
            <div className="p-4 space-y-4">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 font-mono text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-cyan-400 shrink-0" />
                    <p className="text-cyan-400 uppercase tracking-wider">Manufacturer</p>
                  </div>
                  <p className="text-[#00ff00] pl-6">{plane.manufacturer !== "Unknown Manufacturer" ? plane.manufacturer : "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                    <p className="text-cyan-400 uppercase tracking-wider">First Flight</p>
                  </div>
                  <p className="text-[#00ff00] pl-6">{plane.firstFlight !== "Date unknown" ? plane.firstFlight : "N/A"}</p>
                </div>
              </div>

              {/* Description */}
              <div className="font-mono">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  <p className="text-cyan-400 uppercase tracking-wider text-sm">Description</p>
                </div>
                <div className={cn(
                  "text-sm leading-relaxed pl-6",
                  "transition-all duration-500",
                  isExpanded ? "line-clamp-none" : "line-clamp-3",
                  "text-cyan-100"
                )}>
                  {plane.description}
                </div>
              </div>

              {/* Extended Info */}
              {renderSpecifications()}
              {renderHistory()}
            </div>
          </div>

          {/* Expand Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-cyan-500/20 p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleExpand}
              className={cn(
                "w-full text-xs border-cyan-500/20 bg-[#0a0a0a]/50 rounded-none",
                "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10",
                isLoadingExtended && isExpanded && "opacity-50"
              )}
              disabled={isLoadingExtended && isExpanded}
            >
              <span className="mr-2 font-mono">
                {isExpanded ? (
                  isLoadingExtended ? 'SYS.LOADING' : 'SYS.COLLAPSE'
                ) : (
                  'SYS.EXPAND'
                )}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isImageFullscreen && (
        <div 
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            "transition-all duration-300 ease-in-out",
            isClosing ? "bg-[#0a0a0a]/0 opacity-0" : "bg-[#0a0a0a]/95 opacity-100"
          )}
          onClick={closeFullscreen}
        >
          <div 
            className={cn(
              "relative max-w-[90%] max-h-[90%] overflow-hidden",
              "transition-all duration-300 ease-in-out transform",
              isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 bg-[#0a0a0a]/50 hover:bg-[#0a0a0a]/70 text-cyan-400 rounded-none"
              onClick={closeFullscreen}
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="relative">
              {/* Decorative corners for fullscreen */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-cyan-500/40" />
              <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-cyan-500/40" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-cyan-500/40" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-cyan-500/40" />
              <img
                src={plane.imageUrl}
                alt={plane.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};