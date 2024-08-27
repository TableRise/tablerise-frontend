'use client';

import { useState } from 'react';
import RecoverPasswordContext from '@/context/RecoverPasswordContext';
import axios, { AxiosError } from 'axios';

export default function RecoverPasswordProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [userVerify, setUserVerify] = useState<any>({
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

    const value = {
        verify,
        userVerify,
        setCode,
    };

    return (
        <RecoverPasswordContext.Provider value={value}>
            {children}
        </RecoverPasswordContext.Provider>
    );
}
