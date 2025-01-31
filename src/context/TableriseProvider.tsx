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
    const [darkModeOn, setDarkModeOn] = useState(false);

    const value = useMemo(
        () => ({
            loading,
            newPassVisible,
            darkModeOn,
            setLoading,
            setNewPassVisible,
            setDarkModeOn,
        }),
        [loading, newPassVisible, darkModeOn]
    );

    return (
        <TableriseContext.Provider value={value}>{children}</TableriseContext.Provider>
    );
}
