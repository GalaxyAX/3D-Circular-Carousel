'use client';

import Link from 'next/link';

const navLinks = ['Explore', 'Learn', 'Build', 'Bridge'];

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-[100px] z-50 flex items-center px-6 md:px-12 w-full mx-auto pt-6">
      <div className="text-white font-black text-3xl tracking-tighter uppercase border-4 border-white px-3 py-1 bg-black/20 backdrop-blur-sm">
        APECHAIN
      </div>
      
      <nav className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center space-x-12">
        {navLinks.map((link) => (
          <Link 
            key={link} 
            href="#"
            className="text-[#d8dcc8] hover:text-white transition-colors uppercase text-[22px] font-bold tracking-widest font-sans"
            style={{ fontStretch: 'condensed' }}
          >
            {link}
          </Link>
        ))}
      </nav>
    </header>
  );
}
