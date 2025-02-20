'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginRedirectParams(): JSX.Element {
    const searchParams = useSearchParams();
    const router = useRouter();
    const userData = searchParams.get('userData');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (userData) {
                localStorage.setItem('userLogged', decodeURIComponent(userData || ''));
            }

            router.replace('/');
        }
    }, [userData, router]);

    return <p>...</p>;
}
