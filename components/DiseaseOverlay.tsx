import React, { useMemo } from 'react';

const DiseaseOverlay: React.FC = () => {
  // Generate random detection points concentrated towards the center (likely where leaf is)
  const spots = useMemo(() => {
    const count = Math.floor(Math.random() * 3) + 3; // 3 to 5 spots
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      top: 20 + Math.random() * 60, // Keep within 20-80% height to avoid edges
      left: 20 + Math.random() * 60, // Keep within 20-80% width
      size: 40 + Math.random() * 40,  // Random size
      delay: Math.random() * 0.5,     // Random animation delay
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-lg">
      {spots.map((spot) => (
        <div
          key={spot.id}
          className="absolute flex items-center justify-center"
          style={{
            top: `${spot.top}%`,
            left: `${spot.left}%`,
            width: `${spot.size}px`,
            height: `${spot.size}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Pulsing Ring */}
          <div 
            className="absolute w-full h-full rounded-full border-2 border-red-500/80 opacity-0 animate-ping"
            style={{ animationDuration: '1s', animationDelay: `${spot.delay}s` }}
          ></div>
          
          {/* Inner Dot */}
          <div 
            className="absolute w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"
          ></div>
          
          {/* Connecting Lines Effect (Optional decoration) */}
          <div className="absolute w-[120%] h-[1px] bg-red-500/20 rotate-45"></div>
          <div className="absolute w-[120%] h-[1px] bg-red-500/20 -rotate-45"></div>
          
          {/* Fake Confidence Score */}
          <div className="absolute -top-4 left-4 bg-red-900/80 text-[8px] text-red-200 px-1 rounded border border-red-500/30">
            {90 + Math.floor(Math.random() * 9)}%
          </div>
        </div>
      ))}
      
      {/* Overall tint/vignette to focus attention */}
      <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay animate-pulse"></div>
    </div>
  );
};

export default DiseaseOverlay;