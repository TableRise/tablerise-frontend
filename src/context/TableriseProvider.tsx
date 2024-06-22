'use client'

import { useMemo } from 'react';
import TableriseContext from '@/context/TableriseContext';

export default function TableriseProvider({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    const value = useMemo(() => ({}), []);
    
    return (
        <TableriseContext.Provider value={value}>
            {children}
        </TableriseContext.Provider>
    )
}
