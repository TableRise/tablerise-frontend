'use client';

import { useEffect, useState } from 'react';

export interface StoredUserRecord {
    userId?: string;
    result?: {
        userId?: string;
    };
    user?: {
        userId?: string;
    };
    [key: string]: unknown;
}

export function normalizeStoredUserId(
    storedUser: StoredUserRecord | null | undefined
): string {
    const rawUserId =
        storedUser?.userId ?? storedUser?.result?.userId ?? storedUser?.user?.userId;

    return typeof rawUserId === 'string' ? rawUserId.trim() : '';
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
