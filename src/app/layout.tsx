import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import TableriseProvider from '@/context/TableriseProvider';
import '@/app/globals.css';
import { cookies } from 'next/headers';

const dm_sans = DM_Sans({ variable: '--dm-sans-base', subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'TableRise - Sua mesa virtual de RPG online',
    description: 'Sua mesa virtual de RPG online',
    icons: {
        icon: [
            {
                media: '(prefers-color-scheme: light)',
                url: '/images/icon-light.ico',
                href: '/images/icon-light.ico',
            },
            {
                media: '(prefers-color-scheme: dark)',
                url: '/images/icon-dark.ico',
                href: '/images/icon-dark.ico',
            },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const recoverUserInfo = cookies().get('token') ? 1 : 0;

    return (
        <html lang="en">
            <body className={dm_sans.className}>
                <TableriseProvider userLogged={recoverUserInfo}>
                    {children}
                </TableriseProvider>
            </body>
        </html>
    );
}
