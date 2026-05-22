import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { cookies } from 'next/headers';
import HeaderToggle from '@/components/common/HeaderToggle';
import TableriseProvider from '@/context/TableriseProvider';
import Footer from '@/components/common/Footer';

const dm_sans = DM_Sans({ variable: '--dm-sans-base', subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'TableRise - Termos de Uso',
    description: 'Termos de uso da plataforma TableRise',
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

export default function TermsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const recoverUserInfo = cookies().get('token') ? 1 : 0;

    return (
        <html lang="en">
            <body className={dm_sans.className} style={{ marginTop: '8.6rem' }}>
                <HeaderToggle userLogged={recoverUserInfo} />
                <TableriseProvider userLogged={recoverUserInfo}>
                    {children}
                </TableriseProvider>
                <Footer />
            </body>
        </html>
    );
}
