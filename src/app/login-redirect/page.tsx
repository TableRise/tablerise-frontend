'use client';
import LoginRedirectParams from '@/components/authentication/LoginRedirectParams';
import './styles/page.css';
import { Suspense } from 'react';

export default function LoginRedirect(): JSX.Element {
    return (
        <Suspense>
            <LoginRedirectParams />
        </Suspense>
    );
}
