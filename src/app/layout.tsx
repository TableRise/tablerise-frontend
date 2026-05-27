import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import TableriseProvider from '@/context/TableriseProvider';
import { cookies } from 'next/headers';
import { getThemeBootstrapScript } from '@/utils/theme';
import '@/app/globals.css';

const dm_sans = DM_Sans({ variable: '--dm-sans-base', subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'TableRise - Sua mesa virtual de RPG online',
    description: 'Sua mesa virtual de RPG online',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const recoverUserInfo = cookies().get('token') ? 1 : 0;

    return (
        <html lang="en" data-theme="light" suppressHydrationWarning>
            <head>
                <link
                    rel="icon"
                    href="/images/icon-light.ico"
                    type="image/x-icon"
                    data-tablerise-favicon="true"
                />
                <script dangerouslySetInnerHTML={{ __html: getThemeBootstrapScript() }} />
            </head>
            <body className={dm_sans.className}>
                <TableriseProvider userLogged={recoverUserInfo}>
                    {children}
                </TableriseProvider>
            </body>
        </html>
    );
}
