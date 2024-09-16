import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import TableriseProvider from '@/context/TableriseProvider';
import '@/app/globals.css';

const dm_sans = DM_Sans({ variable: '--dm-sans-base', subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'TableRise - Sua mesa virtual de RPG online',
    description: 'Sua mesa virtual de RPG online',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={dm_sans.className}>
                <TableriseProvider>{children}</TableriseProvider>
            </body>
        </html>
    );
}
