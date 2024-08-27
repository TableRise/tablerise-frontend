'use client';

import { useMemo } from 'react';
import RecoverPasswordContext from '@/context/RecoverPasswordContext';

export default function RecoverPasswordProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const value = useMemo(() => ({}), []);

    return (
        <RecoverPasswordContext.Provider value={value}>
            {children}
        </RecoverPasswordContext.Provider>
    );
}
