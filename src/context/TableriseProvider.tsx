'use client';
import { useMemo, useState, useEffect } from 'react';
import TableriseContext from '@/context/TableriseContext';

export default function TableriseProvider({
    children,
    userLogged,
}: Readonly<{
    children: React.ReactNode;
    userLogged: number;
}>) {
    const [loading, setLoading] = useState(false);
    const [newPassVisible, setNewPassVisible] = useState(false);
    const [darkModeOn, setDarkModeOn] = useState(false);
    const [userLoggedToggle] = useState(userLogged);

    const value = useMemo(
        () => ({
            loading,
            newPassVisible,
            darkModeOn,
            userLoggedToggle,
            setLoading,
            setNewPassVisible,
            setDarkModeOn,
        }),
        [loading, newPassVisible, darkModeOn, userLoggedToggle]
    );

    return (
        <TableriseContext.Provider value={value}>{children}</TableriseContext.Provider>
    );
}
