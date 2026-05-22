import Header from '@/components/hero/Header';
import BackgroundEffects from '@/components/hero/BackgroundEffects';
import CircularCarousel from '@/components/hero/CircularCarousel';

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#353A1B] text-white flex flex-col font-sans">
      <BackgroundEffects />
      <Header />
      
      {/* 3D Circular Carousel Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <CircularCarousel />
      </div>
    </main>
  );
}
