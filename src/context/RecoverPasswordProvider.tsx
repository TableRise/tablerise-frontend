'use client';

import { useState } from 'react';
import RecoverPasswordContext from '@/context/RecoverPasswordContext';
import axios, { AxiosError } from 'axios';
import { sendConfirmEmail, sendNewPassword } from '@/server/users/update-password';

export default function RecoverPasswordProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [userVerify, setUserVerify] = useState<{ email: string, code: string }>({
        email: '',
        code: ''
    });

    const setCode = (code: string) => {
        setUserVerify({
            ...userVerify,
            code,
        })
    }

    const verify = async (email: string) => {
        try {
            await sendConfirmEmail(email);

            setUserVerify({
                ...userVerify,
                email,
            });
        } catch (error: AxiosError | unknown) {
            throw new Error('Email invalido');
        }

    }

    const updatePassword = async (newPassword: string) => {
        const { email, code } = userVerify;
        try {
            await sendNewPassword({ email, newPassword, code });
        } catch (error: AxiosError | unknown) {
            throw new Error('Email invalido');
        }

    }

    const value = {
        verify,
        userVerify,
        setCode,
        updatePassword,
    };

    return (
        <RecoverPasswordContext.Provider value={value}>
            {children}
        </RecoverPasswordContext.Provider>
    );
}
