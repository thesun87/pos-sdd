import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-sans' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // For touch optimization
};

export const metadata: Metadata = {
  title: 'POS SDD',
  description: 'Point of Sale System - Modern Bistro',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
