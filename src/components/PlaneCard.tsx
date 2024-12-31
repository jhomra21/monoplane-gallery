import { Heart, Share2, Bookmark } from "lucide-react";
import { useState } from "react";

interface PlaneCardProps {
  plane: {
    id: number;
    name: string;
    manufacturer: string;
    firstFlight: string;
    description: string;
    imageUrl: string;
  };
}

export const PlaneCard = ({ plane }: PlaneCardProps) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="plane-card relative w-full flex items-end animate-card-enter">
      <img
        src={plane.imageUrl}
        alt={plane.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="card-content relative w-full p-6 pt-24">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="font-mono text-2xl font-semibold mb-2">{plane.name}</h2>
            <p className="text-primary-light font-mono text-sm mb-1">
              {plane.manufacturer} • First Flight: {plane.firstFlight}
            </p>
            <p className="text-light/80 text-sm leading-relaxed max-w-[90%]">
              {plane.description}
            </p>
          </div>
          
          <div className="flex flex-col gap-6">
            <button
              onClick={() => setLiked(!liked)}
              className="flex flex-col items-center gap-1"
            >
              <Heart
                className={`w-8 h-8 ${
                  liked ? "fill-primary text-primary" : "text-light"
                }`}
              />
              <span className="text-xs font-mono">Like</span>
            </button>
            
            <button
              onClick={() => setSaved(!saved)}
              className="flex flex-col items-center gap-1"
            >
              <Bookmark
                className={`w-8 h-8 ${
                  saved ? "fill-primary text-primary" : "text-light"
                }`}
              />
              <span className="text-xs font-mono">Save</span>
            </button>
            
            <button className="flex flex-col items-center gap-1">
              <Share2 className="w-8 h-8 text-light" />
              <span className="text-xs font-mono">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};