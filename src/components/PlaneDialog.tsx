import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Plane, Calendar, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface PlaneDialogProps {
  plane: {
    id: number
    name: string
    manufacturer: string
    firstFlight: string
    description: string
    imageUrl: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getWikipediaUrl = (planeName: string) => {
  const searchTerm = planeName.replace(/\s+/g, '_');
  return `https://en.wikipedia.org/wiki/${searchTerm}`;
};

export function PlaneDialog({ plane, open, onOpenChange }: PlaneDialogProps) {
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl bg-[#0a0a0a] border-cyan-500/20 rounded-none [&>button]:rounded-none [&>button]:hover:bg-cyan-500/10">
          <div className="grid grid-cols-2 gap-8 p-1">
            {/* Image Section */}
            <div 
              className="relative aspect-[4/3] overflow-hidden cursor-zoom-in group"
              onClick={openFullscreen}
            >
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
            </div>

            {/* Info Section */}
            <div className="space-y-6 font-mono relative">
              {/* Decorative top line */}
              <div className="absolute -top-1 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0" />
              
              <div>
                <a 
                  href={getWikipediaUrl(plane.name)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block"
                >
                  <h2 className="text-2xl font-bold text-[#00ff00] mb-2 hover:text-cyan-400 transition-colors">
                    {plane.name}
                  </h2>
                </a>
                <div className="text-xs text-cyan-400 font-mono">
                  SYS.ID: {plane.id.toString().padStart(4, '0')}
                </div>
              </div>

              <div className="space-y-4">
                {/* Manufacturer */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-cyan-400 shrink-0" />
                    <p className="text-cyan-400 uppercase tracking-wider text-sm">Manufacturer</p>
                  </div>
                  <p className="text-[#00ff00] pl-6 font-mono">
                    {plane.manufacturer !== "Unknown Manufacturer" ? plane.manufacturer : "N/A"}
                  </p>
                </div>

                {/* First Flight */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                    <p className="text-cyan-400 uppercase tracking-wider text-sm">First Flight</p>
                  </div>
                  <p className="text-[#00ff00] pl-6 font-mono">
                    {plane.firstFlight !== "Date unknown" ? plane.firstFlight : "N/A"}
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                    <p className="text-cyan-400 uppercase tracking-wider text-sm">Description</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-1 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500/0 via-cyan-500/20 to-cyan-500/0" />
                    <p className="text-cyan-100 leading-relaxed pl-6 font-mono">
                      {plane.description}
                    </p>
                  </div>
                </div>
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