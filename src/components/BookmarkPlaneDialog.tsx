import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Plane, Calendar, Info, X, ExternalLink, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface BookmarkPlaneDialogProps {
  plane: {
    id: number
    name: string
    manufacturer: string
    firstFlight: string
    imageUrl: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getWikipediaUrl = (planeName: string) => {
  const searchTerm = planeName.replace(/\s+/g, '_');
  return `https://en.wikipedia.org/wiki/${searchTerm}`;
};

export function BookmarkPlaneDialog({ plane, open, onOpenChange }: BookmarkPlaneDialogProps) {
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

  // Don't render anything if plane is null
  if (!plane) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn(
          "relative max-w-2xl bg-[#0a0a0a] border-cyan-500/20 p-0",
          "!rounded-none [&>*]:rounded-none",
          "[&>button]:rounded-none [&>button]:hover:bg-cyan-500/10",
          "fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        )}>
          <DialogTitle className="sr-only">
            {plane.name} Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed information about {plane.name}, including manufacturer, first flight date, and image.
          </DialogDescription>

          {/* Title Section */}
          <div className="relative px-6 pt-6">
            <div className="absolute -top-px left-0 right-0 h-px">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0" />
            </div>
            <div className="absolute -left-px top-0 bottom-0 w-px">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/0 via-cyan-500/20 to-cyan-500/0" />
            </div>
            <div className="absolute -right-px top-0 bottom-0 w-px">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/0 via-cyan-500/20 to-cyan-500/0" />
            </div>

            <div className="relative z-10">
              <a 
                href={getWikipediaUrl(plane.name)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block"
              >
                <h2 className="text-2xl font-bold font-mono text-[#00ff00] hover:text-cyan-400 transition-colors">
                  {plane.name}
                </h2>
              </a>
              <div className="text-xs text-cyan-400 font-mono mt-1">
                SYS.ID: {plane.id.toString().padStart(4, '0')}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Image Section */}
            <div className="relative aspect-video overflow-hidden group">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-500/40" />
              <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-500/40" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-500/40" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-500/40" />
              
              <img
                src={plane.imageUrl}
                alt={plane.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Image Actions */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openFullscreen}
                  className="bg-[#0a0a0a]/50 hover:bg-[#0a0a0a]/70 text-cyan-400 rounded-none"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="sr-only">View fullscreen</span>
                </Button>
                <a
                  href={getWikipediaUrl(plane.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 bg-[#0a0a0a]/50 hover:bg-[#0a0a0a]/70 text-cyan-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="sr-only">View on Wikipedia</span>
                </a>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 font-mono">
              {/* Manufacturer */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-cyan-400 shrink-0" />
                  <p className="text-cyan-400 uppercase tracking-wider text-sm">Manufacturer</p>
                </div>
                <p className="text-[#00ff00] pl-6">
                  {plane.manufacturer !== "Unknown Manufacturer" ? plane.manufacturer : "N/A"}
                </p>
              </div>

              {/* First Flight */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                  <p className="text-cyan-400 uppercase tracking-wider text-sm">First Flight</p>
                </div>
                <p className="text-[#00ff00] pl-6">
                  {plane.firstFlight !== "Date unknown" ? plane.firstFlight : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              <span className="sr-only">Close fullscreen</span>
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
  )
} 