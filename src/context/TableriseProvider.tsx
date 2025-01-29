'use client';

import { useMemo, useState } from 'react';
import TableriseContext from '@/context/TableriseContext';

export default function TableriseProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [loading, setLoading] = useState(false);
    const [newPassVisible, setNewPassVisible] = useState(false);

    const value = useMemo(
        () => ({
            loading,
            newPassVisible,
            setLoading,
            setNewPassVisible,
        }),
        [loading, newPassVisible]
    );

    return (
        <TableriseContext.Provider value={value}>{children}</TableriseContext.Provider>
    );
}
