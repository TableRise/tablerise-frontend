'use client';

import { useEffect } from 'react';
import { normalizeStoredUserId, type StoredUserRecord } from '@/hooks/useStoredUser';
import '@/app/profile/page.css';

export default function ProfileRedirectPage(): JSX.Element {
    useEffect(() => {
        try {
            const storedUserRaw = localStorage.getItem('userLogged');

            if (!storedUserRaw) {
                window.location.replace('/login');
                return;
            }

            const storedUser = JSON.parse(storedUserRaw) as StoredUserRecord | null;
            const normalizedUserId = normalizeStoredUserId(storedUser);

            if (!normalizedUserId) {
                window.location.replace('/login');
                return;
            }

            window.location.replace(`/profile/${normalizedUserId}`);
        } catch {
            window.location.replace('/login');
        }
    }, []);

    return (
        <main className="profile-redirect-page">
            <p className="font-S-regular text-color-greyScale/700">Redirecionando...</p>
        </main>
    );
}
