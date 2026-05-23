'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const navLinks = ['Explore', 'Learn', 'Build', 'Bridge'];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-[100px] z-50 flex items-center px-6 md:px-12 w-full mx-auto justify-between md:justify-start">
      {/* Mobile Menu Button - Left on mobile, hidden on md */}
      <button 
        className="md:hidden text-white z-50 p-2 -ml-2"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Logo - Center on mobile, Left on md */}
      <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:left-auto text-white tracking-tighter uppercase border-4 border-white px-3 py-1 bg-black/20 backdrop-blur-sm font-bold text-[25px] font-[system-ui] z-40">
        APECHAIN
      </div>
      
      {/* Desktop Nav - Hidden on mobile, right of logo on tablet, Center on desktop */}
      <nav className="hidden md:flex items-center md:space-x-8 lg:space-x-12 md:ml-10 lg:ml-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
        {navLinks.map((link) => (
          <Link 
            key={link} 
            href="#"
            className="text-[#d8dcc8] hover:text-white transition-colors uppercase tracking-widest text-[20px] font-bold font-[system-ui]"
            style={{ fontStretch: 'condensed' }}
          >
            {link}
          </Link>
        ))}
      </nav>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[100px] left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-white/10 md:hidden flex flex-col items-center py-8 space-y-8 z-30 shadow-2xl"
          >
            {navLinks.map((link) => (
              <Link
                key={`mobile-${link}`}
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#d8dcc8] hover:text-white transition-colors uppercase tracking-widest text-[24px] font-bold font-[system-ui]"
                style={{ fontStretch: 'condensed' }}
              >
                {link}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

