'use client';

import { useState } from 'react';
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
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const setCode = async (code: string) => {
        try {
            const { accountSecurityMethod, secretQuestion } = await authenticateEmail(
                userVerify.email,
                code
            );
            if (secretQuestion) setUserVerify({ ...userVerify, secretQuestion });

            if (accountSecurityMethod == 'secret-question')
                router.push('/password-recover/secret-question');

            if (accountSecurityMethod == 'two-factor')
                router.push('/password-recover/two-factor');
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const sendSecretQuestion = async (answer: string) => {
        try {
            await authenticateSecretQuestion(
                userVerify.email,
                userVerify.secretQuestion,
                answer
            );

            router.push('/password-recover/new-password');
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const twoFactor = async (code: string) => {
        try {
            const result = await authenticate2fa(userVerify.email, code);

            router.push('/password-recover/new-password');
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

    const value = {
        verify,
        userVerify,
        setCode,
        updatePassword,
        sendSecretQuestion,
        twoFactor,
    };

    return (
        <RecoverPasswordContext.Provider value={value}>
            {children}
        </RecoverPasswordContext.Provider>
    );
}
