'use client';
import React, { useState } from 'react';
import SocialLoginButton from './SocialLoginButton';
import '@/components/authentication/styles/SocialLoginContainer.css';

export default function SocialLoginContainer(): JSX.Element {
    const [error, setError] = useState<boolean>(false);

    return (
        <div>
            <div className="buttons-container">
                <SocialLoginButton
                    title="Discord"
                    socialType={'discord'}
                    setError={setError}
                />
                <SocialLoginButton
                    title="Google"
                    socialType={'google'}
                    setError={setError}
                />
            </div>
            <p className="error-message font-XXS-bold" hidden={!error}>
                Erro ao fazer login
            </p>
        </div>
    );
}
