'use client';
import { Suspense } from 'react';

import LoginFormCredentials from './LoginFormCredentials';
import LoginFormHeader from './LoginFormHeader';
import SocialLoginContainer from '../common/SocialLoginContainer';

import './styles/LoginForm.css';

export default function LoginForm(): JSX.Element {
    return (
        <div className="login-form-container">
            <div className="login-form-content">
                <LoginFormHeader />
                <LoginFormCredentials />
                <Suspense>
                    <SocialLoginContainer />
                </Suspense>
            </div>
        </div>
    );
}
