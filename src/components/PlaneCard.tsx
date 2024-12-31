import { Maximize2, X, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const openFullscreen = useCallback(() => {
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

  const handleToggleExpand = () => {
    onToggleExpand?.(plane.id.toString());
  };

  return (
    <>
      <div className={cn(
        "absolute inset-0 rounded-lg overflow-hidden",
        "transition-all duration-500 ease-in-out"
      )}>
        <div 
          className="absolute inset-0 cursor-zoom-in"
          onClick={openFullscreen}
        >
          <img
            src={plane.imageUrl}
            alt={plane.name}
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              "transition-all duration-500 ease-in-out transform",
              isExpanded ? "scale-105 brightness-90" : "scale-100 brightness-100"
            )}
          />
        </div>
        <div className={cn(
          "absolute inset-x-0 bottom-0 p-8",
          "transition-all duration-500 ease-in-out transform",
          "bg-gradient-to-t from-dark from-50% via-dark/90 to-transparent",
          isExpanded ? "h-2/3" : "h-[45%]"
        )}>
          <div className="h-full flex flex-col justify-end">
            <div className="flex justify-between items-start gap-6">
              <div className="flex-1">
                <h2 className="font-mono text-3xl font-semibold mb-3 text-primary">{plane.name}</h2>
                <div className="space-y-1.5 mb-4">
                  <p className="text-primary-light font-mono text-sm">
                    {plane.manufacturer !== "Unknown Manufacturer" ? (
                      <span>Manufacturer: {plane.manufacturer}</span>
                    ) : (
                      <span className="text-primary/40">Manufacturer unknown</span>
                    )}
                  </p>
                  <p className="text-primary-light font-mono text-sm">
                    {plane.firstFlight !== "Date unknown" ? (
                      <span>First Flight: {plane.firstFlight}</span>
                    ) : (
                      <span className="text-primary/40">First flight date unknown</span>
                    )}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className={cn(
                    "overflow-hidden transition-all duration-500",
                    isExpanded ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0"
                  )}>
                    <div className="space-y-4 text-sm text-light/90">
                      <p className="leading-relaxed">{plane.description}</p>
                      <div className="pt-4 space-y-4 text-light/80">
                        <p>The {plane.name} represents a significant milestone in aviation history, showcasing advanced engineering and innovative design principles of its time.</p>
                        <p>Manufactured by {plane.manufacturer}, this aircraft has played a crucial role in shaping modern aviation and continues to influence aerospace engineering today.</p>
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "overflow-hidden transition-all duration-500",
                    !isExpanded ? "opacity-100 max-h-[80px]" : "opacity-0 max-h-0"
                  )}>
                    <p className="text-light/90 text-sm leading-relaxed line-clamp-3">
                      {plane.description}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-primary/60 hover:text-primary transition-colors group",
                      "bg-dark/50 backdrop-blur-sm",
                      "mt-2"
                    )}
                    onClick={handleToggleExpand}
                  >
                    <span className="mr-2">{isExpanded ? 'Show less' : 'Show more'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                    ) : (
                      <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col gap-6">
                <a
                  href={getWikipediaUrl(plane.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 group"
                >
                  <ExternalLink className="w-8 h-8 text-light group-hover:text-primary transition-colors" />
                  <span className="text-xs font-mono text-light/60 group-hover:text-primary transition-colors">Wikipedia</span>
                </a>

                <button
                  onClick={openFullscreen}
                  className="flex flex-col items-center gap-1 group"
                >
                  <Maximize2
                    className="w-8 h-8 text-light group-hover:text-primary transition-colors"
                  />
                  <span className="text-xs font-mono text-light/60 group-hover:text-primary transition-colors">Fullscreen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isImageFullscreen && (
        <div 
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            "transition-all duration-300 ease-in-out",
            isClosing ? "bg-dark/0 opacity-0" : "bg-dark/95 opacity-100"
          )}
          onClick={closeFullscreen}
        >
          <div 
            className={cn(
              "relative max-w-[90%] max-h-[90%] rounded-lg overflow-hidden",
              "transition-all duration-300 ease-in-out transform",
              isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 bg-dark/50 hover:bg-dark/70"
              onClick={closeFullscreen}
            >
              <X className="w-5 h-5" />
            </Button>
            <img
              src={plane.imageUrl}
              alt={plane.name}
              className={cn(
                "w-full h-full object-contain",
                "transition-all duration-300 ease-in-out transform",
                "rounded-lg"
              )}
            />
          </div>
        </div>
      )}
    </>
  );
};