'use client';
import React, { useState } from 'react';
import SocialLoginButton from './SocialLoginButton';
import '@/components/authentication/styles/SocialLoginContainer.css';
import InputErrorMessage from './inputErrorMessage';

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
            {error && <InputErrorMessage errorMessage="Erro ao fazer login" />}
        </div>
    );
}
