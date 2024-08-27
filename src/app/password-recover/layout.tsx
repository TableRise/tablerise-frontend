import RecoverPasswordProvider from '@/context/RecoverPasswordProvider';

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <RecoverPasswordProvider>
            {children}
        </RecoverPasswordProvider>
    );
}
