import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Global styles
import AudioPlayer from '@/components/AudioPlayer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Heroverse Hero',
  description: 'The Place to Ape',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased bg-[#030208]" suppressHydrationWarning>
        <AudioPlayer />
        {children}
      </body>
    </html>
  );
}
