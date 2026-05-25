import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import HeaderToggle from '@/components/common/HeaderToggle';
import Footer from '@/components/common/Footer';

export const metadata: Metadata = {
    title: 'TableRise - Sobre',
    description: 'Saiba mais sobre o TableRise',
};

export default function AboutLayout({
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
