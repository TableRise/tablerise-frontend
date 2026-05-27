import CheckeredBackground from '@/components/common/CheckeredBackground';
import LoginForm from '@/components/login/LoginForm';
import LoginCompleteOAuthGuard from '@/components/login/LoginCompleteOAuthGuard';
import { Suspense } from 'react';
import './styles/page.css';

export default function Login(): JSX.Element {
    return (
        <section className="login-page">
            <CheckeredBackground />
            <LoginForm />
            <Suspense>
                <LoginCompleteOAuthGuard />
            </Suspense>
        </section>
    );
}
