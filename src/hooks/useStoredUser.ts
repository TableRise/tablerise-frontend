'use client';

import { useEffect, useState } from 'react';

export interface StoredUserRecord {
    userId?: string;
    [key: string]: unknown;
}

export function useStoredUser<T extends StoredUserRecord = StoredUserRecord>() {
    const [storedUser, setStoredUser] = useState<T | null>(null);
    const [hasResolvedStoredUser, setHasResolvedStoredUser] = useState(false);

    useEffect(() => {
        try {
            const storedUserRaw = localStorage.getItem('userLogged');
            setStoredUser(storedUserRaw ? (JSON.parse(storedUserRaw) as T) : null);
        } catch {
            setStoredUser(null);
        } finally {
            setHasResolvedStoredUser(true);
        }
    }, []);

    return {
        storedUser,
        hasResolvedStoredUser,
    };
}
