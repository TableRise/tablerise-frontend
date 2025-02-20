'use client';
import './styles/page.css';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';

export default function LoginRedirect(): JSX.Element {
    const searchParams = useSearchParams();
    const router = useRouter();
    const userData = searchParams.get('userData');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (userData) {
                localStorage.setItem('userLogged', String(userData));
            }

            router.replace('/');
        }
    }, [userData]);

    return (
        <Suspense>
            <p>...</p>;
        </Suspense>
    );
}
