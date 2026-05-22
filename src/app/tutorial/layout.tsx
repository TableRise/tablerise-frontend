import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import HeaderToggle from '@/components/common/HeaderToggle';
import Footer from '@/components/common/Footer';

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
        <>
            <HeaderToggle userLogged={recoverUserInfo} />
            <div style={{ paddingTop: 'var(--app-header-offset)' }}>{children}</div>
            <Footer />
        </>
    );
}
