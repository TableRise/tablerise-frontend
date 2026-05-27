'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@/app/profile/page.css';

type StoredUser = {
    userId?: string;
};

export default function ProfileRedirectPage(): JSX.Element {
    const router = useRouter();

    useEffect(() => {
        try {
            const storedUserRaw = localStorage.getItem('userLogged');

            if (!storedUserRaw) {
                router.replace('/login');
                return;
            }

            const storedUser = JSON.parse(storedUserRaw) as StoredUser | null;

            if (!storedUser?.userId) {
                router.replace('/login');
                return;
            }

            router.replace(`/profile/${storedUser.userId}`);
        } catch {
            router.replace('/login');
        }
    }, [router]);

    return (
        <main className="profile-redirect-page">
            <p className="font-S-regular text-color-greyScale/700">Redirecionando...</p>
        </main>
    );
}
