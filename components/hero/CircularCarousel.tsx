'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import AppCard from './AppCard';

const D_APPS = [
  { title: "APECHURCH", category: "Games", desc: "FULLY DECENTRALIZED, NON-CUSTODIAL GAMING HUB BUILT ON APECHAIN", img: "https://picsum.photos/seed/churchy/1600/900" },
  { title: "CLUTCH", category: "Finance", desc: "Decentralized parlay platform.", img: "https://picsum.photos/seed/clutchy/1600/900" },
  { title: "OTHERSIDE", category: "Metaverse", desc: "Web3-enabled virtual worlds.", img: "https://picsum.photos/seed/othersidey/1600/900" },
  { title: "OPENSEA", category: "Collectibles", desc: "Trade ApeChain NFTs.", img: "https://picsum.photos/seed/openseay/1600/900" },
  { title: "CAMELOT", category: "Exchange", desc: "Decentralized exchange.", img: "https://picsum.photos/seed/cameloty/1600/900" },
  { title: "BLEVER", category: "Launchpad", desc: "NFT launchpad.", img: "https://picsum.photos/seed/blevery/1600/900" },
  { title: "EXPRESS", category: "Memecoins", desc: "Memecoin toolkit.", img: "https://picsum.photos/seed/expressy/1600/900" },
  { title: "APESCAN", category: "Explorer", desc: "ApeChain's Block Explorer.", img: "https://picsum.photos/seed/scany/1600/900" },
];

export default function CircularCarousel() {
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(rotation);
  const isDraggingRef = useRef(false);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const animationFrameRef = useRef<number>(0);

  const [radius, setRadius] = useState(1200);

  const activeIndexRef = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      setRadius(window.innerWidth < 768 ? 400 : 1200);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let lastTimestamp = performance.now();

    const tick = (timestamp: number) => {
      // Calculate delta time for smooth animation independent of frame rate
      const dt = Math.min(Math.max(timestamp - lastTimestamp, 1), 50);
      lastTimestamp = timestamp;
      
      // Normalized frame factor assuming 60fps (16.66ms per frame)
      const frameFactor = dt / 16.666;

      // Determine active index
      let newActiveIndex = 0;
      let minAbsAngle = 180;
      let activeCardAngle = 0;
      for (let i = 0; i < D_APPS.length; i++) {
         let cardAngle = (i * (360 / D_APPS.length)) + rotationRef.current;
         let normalized = cardAngle % 360;
         if (normalized < -180) normalized += 360;
         if (normalized > 180) normalized -= 360;
         if (Math.abs(normalized) < minAbsAngle) {
            minAbsAngle = Math.abs(normalized);
            newActiveIndex = i;
            activeCardAngle = normalized;
         }
      }

      if (!isDraggingRef.current) {
        if (activeIndexRef.current !== newActiveIndex) {
           activeIndexRef.current = newActiveIndex;
           // The formula precisely covers the required distance while decaying to base speed
           // Area under (V - baseSpeed) = -activeCardAngle
           // V0 - baseSpeed = -activeCardAngle * (1 - friction) -> V0 = -activeCardAngle * 0.20 + baseSpeed
           velocityRef.current = -activeCardAngle * 0.20 - 0.15;
        }

        const baseSpeed = -0.15; // Faster default speed
        
        // Use frameFactor to ensure same friction regardless of refresh rate
        const friction = Math.pow(0.80, frameFactor);
        
        velocityRef.current = (velocityRef.current - baseSpeed) * friction + baseSpeed;
        
        // Apply velocity mapped to time
        rotationRef.current += velocityRef.current * frameFactor;
        
        setRotation(rotationRef.current);
      } else {
        activeIndexRef.current = newActiveIndex;
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, []);

  // Find active card for 2D overlay UI
  let activeIndex = 0;
  let minAbsAngle = 180;
  D_APPS.forEach((app, index) => {
     let cardAngle = (index * (360 / D_APPS.length)) + rotation;
     let normalized = cardAngle % 360;
     if (normalized < -180) normalized += 360;
     if (normalized > 180) normalized -= 360;
     if (Math.abs(normalized) < minAbsAngle) {
        minAbsAngle = Math.abs(normalized);
        activeIndex = index;
     }
  });
  const activeApp = D_APPS[activeIndex];

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    
    const dragFactor = window.innerWidth < 768 ? 0.3 : 0.15;
    const angleChange = deltaX * dragFactor;
    rotationRef.current += angleChange;
    velocityRef.current = angleChange; 
    
    setRotation(rotationRef.current);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const dragFactor = 0.15;
    const angleChange = delta * dragFactor;
    rotationRef.current -= angleChange;
    velocityRef.current = -angleChange; 
    setRotation(rotationRef.current);
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      style={{ perspective: '2000px' }}
    >
      <div 
        className="absolute top-1/2 left-1/2 w-0 h-0"
        style={{ transformStyle: 'preserve-3d', transform: `rotateX(6deg) rotateZ(-3deg) translateZ(-${radius}px)` }}
      >
        {D_APPS.map((app, index) => {
          const cardAngle = (index * (360 / D_APPS.length)) + rotation;
          return (
            <div
              key={app.title}
              className="absolute w-0 h-0"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
              }}
            >
              <AppCard {...app} angle={cardAngle} radius={radius} />
            </div>
          );
        })}
      </div>

      {/* 2D Overlay UI for Active App */}
      <div className="absolute bottom-10 left-6 md:bottom-16 md:left-16 z-50 pointer-events-none flex flex-col justify-end w-full max-w-xl">
         <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-1.5 font-bold text-white uppercase text-[16px] tracking-widest drop-shadow-md">
               <span className="text-xl">🔥</span>
               <span>HOT</span>
            </div>
            <div className="bg-[#444444]/60 backdrop-blur-md rounded-full px-4 py-1.5 text-[11px] font-black text-gray-200 uppercase tracking-widest border border-white/10 shadow-lg">
              {activeApp.category}
            </div>
         </div>
         
         <div className="overflow-hidden">
            <h3 
              key={`title-${activeApp.title}`}
              className="text-white font-black text-7xl md:text-[110px] uppercase tracking-tighter leading-[0.85] mb-5 drop-shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-500" 
              style={{ fontFamily: 'Impact, sans-serif, var(--font-sans)', transform: 'scaleY(1.15)', transformOrigin: 'bottom left' }}
            >
              {activeApp.title}
            </h3>
         </div>
         
         <p 
            key={`desc-${activeApp.title}`}
            className="text-gray-200 text-sm md:text-[15px] max-w-md uppercase font-semibold leading-relaxed tracking-wider mb-8 drop-shadow-md animate-in fade-in duration-700"
         >
           {activeApp.desc}
         </p>

         <button className="pointer-events-auto bg-white text-black font-black uppercase text-sm tracking-[0.2em] py-3.5 hover:scale-[1.02] transition-transform w-[220px] rounded-full shadow-[0_0_30px_rgba(255,255,255,0.7)] border-[4px] border-white/30 bg-clip-padding flex items-center justify-center">
           LAUNCH
         </button>
      </div>

      {/* Interactive Floating Menu (See All Apps & Thumbnails) */}
      <div className="absolute bottom-10 right-6 md:bottom-10 md:right-10 flex flex-col items-end z-50 pointer-events-none">
        {/* See All Apps text here... */}
        <div className="flex items-center space-x-2 text-white font-bold uppercase tracking-widest text-sm mb-4 pointer-events-auto cursor-pointer hover:text-gray-300">
          <span>See All Apps</span>
          <span>►</span>
        </div>
        <div className="flex space-x-3 pointer-events-auto">
          {D_APPS.slice(0, 5).map((app, index) => (
             <div 
               key={`thumb-${app.title}`} 
               className={`w-14 h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${index === 0 ? 'border-white scale-110' : 'border-white/20 hover:border-white/60 bg-black'}`}
               onPointerDown={(e) => e.stopPropagation()}
               onClick={() => {
                  let targetAngle = -(index * (360 / D_APPS.length));
                  rotationRef.current = targetAngle;
                  setRotation(targetAngle);
               }}
             >
                <img src={app.img} alt="" className={`w-full h-full object-cover ${index === 0 ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`} />
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
