'use client';
import { useMemo, useState } from 'react';
import TutorialContext from '@/context/TutorialContext';

export default function TableriseProvider({
    children,
    userLogged,
}: Readonly<{
    children: React.ReactNode;
    userLogged: number;
}>) {
    const [userLoggedToggle] = useState(userLogged);

    const value = useMemo(
        () => ({
            userLoggedToggle,
        }),
        [userLoggedToggle]
    );

    return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}
