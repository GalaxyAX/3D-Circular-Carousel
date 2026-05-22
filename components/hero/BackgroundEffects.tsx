'use client';

export default function BackgroundEffects() {
  return (
    <>
      <div className="fixed inset-0 z-0 bg-[#353A1B]" />
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-overlay"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 142, 66, 0.8) 0%, rgba(10, 15, 5, 0.9) 100%)'
        }}
      />
      <div 
        className="fixed inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-radial-gradient(circle at 30% 20%, transparent, transparent 50px, #fff 51px, transparent 52px),
            repeating-radial-gradient(circle at 80% 80%, transparent, transparent 80px, #fff 81px, transparent 82px)
          `,
          backgroundSize: '150% 150%',
          backgroundPosition: 'center'
        }}
      />
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.9) 100%)'
        }}
      />
    </>
  );
}
