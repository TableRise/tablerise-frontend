import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import TableriseProvider from '@/context/TableriseProvider';
import '@/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TableRise - Sua mesa virtual de RPG online - Rápida e prática',
  description: 'Sua mesa virtual de RPG online - Rápida e prática',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TableriseProvider>{children}</TableriseProvider>
      </body>
    </html>
  );
}
