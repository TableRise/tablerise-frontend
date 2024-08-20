'use client';
import React, { useState } from 'react';
import SocialLoginButton from './SocialLoginButton';

export default function SocialLoginContainer() {
    const [error, setError] = useState<boolean>(false);

    return (
        <div>
            <div className="flex flex-row w-full items-center justify-center gap-3">
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
            <p className="font-XXS-bold text-color-suport/alert" hidden={!error}>
                Erro ao fazer login
            </p>
        </div>
    );
}
