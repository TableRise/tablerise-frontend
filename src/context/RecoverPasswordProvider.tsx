'use client';

import { useState } from 'react';
import RecoverPasswordContext from '@/context/RecoverPasswordContext';
import axios, { AxiosError } from 'axios';

export default function RecoverPasswordProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [userVerify, setUserVerify] = useState<{ email: string, code: string }>({
        email: '',
        code: ''
    });

    const verify = async (email: string) => {
        try {
            await axios.get('api', {
                params: {
                    email,
                },
                headers: {
                    'header-secret': 'key',
                    'Content-Type': 'application/json',
                }
            })

            setUserVerify({
                ...userVerify,
                email,
            });
        } catch (error: AxiosError | unknown) {
            console.log(error);
            throw new Error('Email invalido');
        }

    }

    const setCode = (code: string) => {
        setUserVerify({
            ...userVerify,
            code,
        })
    }

    const updatePassword = async (newPassword: string) => {
        const { email, code } = userVerify;
        try {
            await axios.patch('api',
            {
                password: newPassword,
            },
            {
                params: {
                    email,
                    code,
                },
                headers: {
                    'header-secret': 'key',
                    'Content-Type': 'application/json',
                }
            })
        } catch (error: AxiosError | unknown) {
            console.log(error);
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
