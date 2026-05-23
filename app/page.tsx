import Header from '@/components/hero/Header';
import ProceduralGroundBackground from '@/components/ui/procedural-ground-background';
import CircularCarousel from '@/components/hero/CircularCarousel';

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden flex flex-col text-white font-sans">
      <ProceduralGroundBackground />
      <Header />
      
      {/* 3D Circular Carousel Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <CircularCarousel />
      </div>
    </main>
  );
}
