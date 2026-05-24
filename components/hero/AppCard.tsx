'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AppCardProps {
  title: string;
  category: string;
  desc: string;
  img: string;
  angle: number;
  radius?: number;
}

export default function AppCard({ title, category, desc, img, angle, radius = 1200 }: AppCardProps) {
  // Compute normalized angle between -180 and 180
  let normalizedAngle = angle % 360;
  if (normalizedAngle < -180) normalizedAngle += 360;
  if (normalizedAngle > 180) normalizedAngle -= 360;

  const absAngle = Math.abs(normalizedAngle);
  
  // Depth visuals
  const brightness = 1 - (absAngle / 180) * 0.8; 

  const [cardWidth, setCardWidth] = useState(860);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      setCardWidth(cardRef.current.offsetWidth);
    }
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setCardWidth(entries[0].contentRect.width);
    });
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const SLICES = 24; 
  const sliceWidthPx = cardWidth / SLICES;

  return (
    <div
      ref={cardRef}
      style={{
        transformStyle: 'preserve-3d',
      }}
      className="absolute w-[860px] h-[500px] -ml-[430px] -mt-[250px] group pointer-events-none select-none"
    >
      <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
         {Array.from({ length: SLICES }).map((_, i) => {
            const distance = (i + 0.5) * sliceWidthPx - cardWidth / 2;
            const angleOffset = (distance / radius) * (180 / Math.PI);
            
            return (
              <React.Fragment key={i}>
                {/* OUTWARD FACING SLICE (FRONT) */}
                <div 
                  className="absolute top-0 bottom-0 overflow-hidden"
                  style={{
                    width: `${sliceWidthPx + 1.2}px`,
                    left: '50%',
                    marginLeft: `${-sliceWidthPx / 2}px`,
                    transform: `translateZ(${-radius}px) rotateY(${angleOffset}deg) translateZ(${radius}px)`,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d'
                  }}
                >
                   <div 
                      className="absolute top-0 bottom-0 bg-[#050505] bg-cover bg-center"
                      style={{
                         width: `${cardWidth}px`,
                         left: '50%',
                         transform: `translateX(${-distance}px)`,
                         marginLeft: `${-cardWidth / 2}px`,
                         backfaceVisibility: 'hidden',
                         WebkitBackfaceVisibility: 'hidden',
                         backgroundImage: `url(${img})`
                      }}
                   >
                      
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.5)_0%,rgba(255,255,255,0.02)_15%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.02)_85%,rgba(0,0,0,0.5)_100%)] pointer-events-none mix-blend-overlay" />

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none opacity-60" />
                      
                      {/* Depth Fading Layer based on angle to replace CSS filter/opacity */}
                      <div 
                        className="absolute inset-0 bg-[#050508] pointer-events-none transition-opacity duration-300"
                        style={{ opacity: 1 - Math.max(0.1, brightness) }}
                      />
                   </div>
                </div>

                {/* INWARD FACING SLICE (BACK) */}
                <div 
                  className="absolute top-0 bottom-0 overflow-hidden"
                  style={{
                    width: `${sliceWidthPx + 1.2}px`,
                    left: '50%',
                    marginLeft: `${-sliceWidthPx / 2}px`,
                    // rotateY(180deg) flips it in-place
                    transform: `translateZ(${-radius}px) rotateY(${angleOffset}deg) translateZ(${radius}px) rotateY(180deg)`,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d'
                  }}
                >
                   <div 
                      className="absolute top-0 bottom-0 bg-[#050505] bg-cover bg-center"
                      style={{
                         width: `${cardWidth}px`,
                         left: '50%',
                         // distance is inverted for correct mirroring
                         transform: `translateX(${distance}px)`,
                         marginLeft: `${-cardWidth / 2}px`,
                         backfaceVisibility: 'hidden',
                         WebkitBackfaceVisibility: 'hidden',
                         backgroundImage: `url(${img})`
                      }}
                   >
                      
                      {/* Make the backface visibly darker than the front */}
                      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
                      
                      <div 
                        className="absolute inset-0 bg-[#050508] pointer-events-none transition-opacity duration-300"
                        style={{ opacity: 1 - Math.max(0.1, brightness) }}
                      />
                   </div>
                </div>
              </React.Fragment>
            );
         })}
      </div>
    </div>
  );
}
