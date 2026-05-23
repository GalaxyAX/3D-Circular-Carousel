'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
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
  const targetRotationRef = useRef<number | null>(null);

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
        if (targetRotationRef.current !== null) {
           const diff = targetRotationRef.current - rotationRef.current;
           
           // Smooth ease-out (lerp) to avoid any overshooting (prevents reverse movement)
           const ease = 1 - Math.pow(0.85, frameFactor);
           const change = diff * ease;
           
           rotationRef.current += change;
           velocityRef.current = change / frameFactor;

           // Snap when very close and resume auto-scroll seamlessly
           if (Math.abs(diff) < 0.5) {
              rotationRef.current = targetRotationRef.current;
              targetRotationRef.current = null;
              velocityRef.current = -0.15; 
           }
           setRotation(rotationRef.current);
        } else {
          activeIndexRef.current = newActiveIndex;
          
          const baseSpeed = -0.15; // Faster default speed
        const switchAngle = 180 / D_APPS.length;
        
        // Calculate target velocity with an easy in-out boost
        let targetVelocity = baseSpeed;
        if (activeCardAngle > 0) {
            const factor = activeCardAngle / switchAngle; // 1 down to 0
            // Sine wave creates a smooth acceleration and deceleration based on position
            const boost = Math.sin(factor * Math.PI) * 2.5; 
            targetVelocity = baseSpeed - Math.abs(boost);
        }

        // Smoothly interpolate current velocity to target velocity to preserve drag inertia
        // but lock on quickly during auto-rotation for precise easing
        const isDiverging = Math.abs(velocityRef.current - targetVelocity) > 0.5;
        const frictionRate = isDiverging ? 0.85 : 0.4;
        const friction = Math.pow(frictionRate, frameFactor);
        
        velocityRef.current = (velocityRef.current - targetVelocity) * friction + targetVelocity;
        
        // Apply velocity mapped to time
        rotationRef.current += velocityRef.current * frameFactor;
        
        setRotation(rotationRef.current);
        }
      } else {
        targetRotationRef.current = null;
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
      <div className="absolute bottom-[140px] left-6 md:bottom-[140px] md:left-16 lg:bottom-16 z-50 pointer-events-none flex flex-col justify-end w-full max-w-xl">
         <AnimatePresence mode="wait">
           <motion.div
             key={activeApp.title}
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -15 }}
             transition={{ duration: 0.3 }}
           >
             <div className="flex items-center space-x-4 mb-[21px] ml-[18px]">
                <div className="flex items-center space-x-1.5 font-normal font-sans text-white uppercase text-[12px] leading-[16px] tracking-[0.2em] drop-shadow-md">
                   <span className="text-[16px] leading-[16px]">🔥</span>
                   <span>HOT</span>
                </div>
                <div className="bg-[#444444]/60 backdrop-blur-md rounded-full px-4 py-1.5 font-normal font-sans text-[12px] leading-[16px] text-white uppercase tracking-[0.2em] border border-white/10 shadow-lg">
                  {activeApp.category}
                </div>
             </div>
             
             <div className="overflow-visible ml-[18px]">
                <h3 
                  className="text-white font-black text-7xl md:text-[110px] uppercase tracking-tighter leading-[0.85] mb-[14px] drop-shadow-2xl" 
                  style={{ fontFamily: 'Impact, sans-serif, var(--font-sans)', transform: 'scaleY(1.15)', transformOrigin: 'bottom left' }}
                >
                  {activeApp.title}
                </h3>
             </div>
             
             <p 
                className="text-white font-normal font-sans text-[12px] leading-[16px] max-w-md uppercase tracking-[0.2em] mb-8 drop-shadow-md ml-[18px]"
             >
               {activeApp.desc}
             </p>
           </motion.div>
         </AnimatePresence>

         <button className="pointer-events-auto bg-white text-black font-normal uppercase text-[12px] leading-[16px] font-[system-ui] tracking-[0.2em] hover:scale-[1.02] transition-transform w-[160px] h-[54px] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.7)] border-[4px] border-white/30 bg-clip-padding flex items-center justify-center ml-[18px]">
           LAUNCH
         </button>
      </div>

      {/* Interactive Floating Menu (See All Apps & Thumbnails) */}
      <div className="absolute bottom-6 left-6 md:bottom-10 md:left-16 lg:bottom-10 lg:left-auto lg:right-10 flex flex-col items-start lg:items-end z-50 pointer-events-none">
        {/* See All Apps text here... */}
        <div className="flex items-center space-x-2 text-white font-bold uppercase tracking-widest text-sm mb-2 ml-[18px] lg:ml-0 lg:mr-[18px] pointer-events-auto cursor-pointer hover:text-gray-300">
          <span className="font-normal font-[system-ui] text-[12px] leading-[16px]">See All Apps</span>
          <span>►</span>
        </div>
        <div className="flex space-x-2 md:space-x-3 pointer-events-auto max-w-[90vw] overflow-x-auto px-4 pb-4 pt-2 -mb-4 shrink-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {D_APPS.map((app, index) => {
             const isActive = activeIndex === index;
             return (
               <div 
                 key={`thumb-${app.title}`} 
                 className={`w-10 h-10 md:w-11 md:h-11 shrink-0 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 ${isActive ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.15)]' : 'border-white/20 scale-95 hover:border-white/60 hover:scale-100 bg-black'}`}
                 onPointerDown={(e) => e.stopPropagation()}
                 onClick={() => {
                    let targetAngle = -(index * (360 / D_APPS.length));
                    const currentMod = rotationRef.current % 360;
                    const diff = (targetAngle - currentMod);
                    let normalizedDiff = diff % 360;
                    if (normalizedDiff > 180) normalizedDiff -= 360;
                    if (normalizedDiff < -180) normalizedDiff += 360;
                    targetRotationRef.current = rotationRef.current + normalizedDiff;
                 }}
               >
                  <Image src={app.img} alt={app.title} width={56} height={56} className={`w-full h-full object-cover transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`} />
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
}
