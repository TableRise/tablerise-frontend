'use client';

import { useEffect, useState } from 'react';
import RecoverPasswordContext from '@/context/RecoverPasswordContext';
import {
    authenticate2fa,
    authenticateEmail,
    authenticateSecretQuestion,
    sendConfirmEmail,
    sendNewPassword,
} from '@/server/users/update-password';
import { useRouter } from 'next/navigation';

export default function RecoverPasswordProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);
    const [userVerify, setUserVerify] = useState<{
        email: string;
        id: string;
        secretQuestion: string;
    }>({
        email: '',
        id: '',
        secretQuestion: '',
    });

    const verify = async (email: string) => {
        try {
            await sendConfirmEmail(email);

            setUserVerify({ ...userVerify, email });
            setLoading(false);
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const setCode = async (code: string) => {
        try {
            const { accountSecurityMethod } = await authenticateEmail(
                userVerify.email,
                code
            );

            let securityMethod = accountSecurityMethod;
            let secretQuestion: string | null = null;

            if (accountSecurityMethod.startsWith('secret-question%')) {
                const split = accountSecurityMethod.split('%');
                securityMethod = split[0]; // "secret-question"
                secretQuestion = split[1]; // A pergunta secreta
            }

            if (secretQuestion) setUserVerify({ ...userVerify, secretQuestion });

            if (securityMethod == 'secret-question')
                router.push('/password-recover/secret-question');

            if (securityMethod == 'two-factor')
                router.push('/password-recover/two-factor');
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const sendSecretQuestion = async (answer: string) => {
        try {
            const result = await authenticateSecretQuestion(
                userVerify.email,
                userVerify.secretQuestion,
                answer
            );

            if (result == 200) router.push('/password-recover/new-password');
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const twoFactor = async (code: string) => {
        try {
            const result = await authenticate2fa(userVerify.email, code);

            if (result == 200) router.push('/password-recover/new-password');
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const updatePassword = async (newPassword: string) => {
        const { email } = userVerify;

        try {
            await sendNewPassword(email, newPassword);
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    useEffect(() => {
        if (!userVerify.email) {
            router.push('/password-recover');
        }
    });

    const value = {
        verify,
        userVerify,
        setCode,
        updatePassword,
        sendSecretQuestion,
        twoFactor,
        loading,
        setLoading,
    };

    return (
        <RecoverPasswordContext.Provider value={value}>
            {children}
        </RecoverPasswordContext.Provider>
    );
}
