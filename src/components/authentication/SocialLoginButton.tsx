'use client';
import React from 'react';
import DiscordLogo from '../../../assets/icons/social-midia/discord.svg';
import GoogleLogo from '../../../assets/icons/social-midia/google.svg';
import { getGoogleLogin, getDiscordLogin } from '@/server/users/api';
import { useRouter } from 'next/navigation';

type SocialLoginButtonProps = {
    title: string;
    socialType: 'discord' | 'google';
    setError: any;
};

export default function SocialLoginButton({
    title,
    socialType,
    setError,
}: SocialLoginButtonProps) {
    const router = useRouter();

    const socialLoginHandlers = {
        google: async () => handleGoogleLogin(),
        discord: async () => handleDiscordLogin(),
    };

    const handleGoogleLogin = async () => {
        try {
            await getGoogleLogin();
            router.push('/home');
        } catch (error) {
            setError(true);
        }
    };

    const handleDiscordLogin = async () => {
        try {
            await getDiscordLogin();
            router.push('/home');
        } catch (error) {
            setError(true);
        }
    };

    return (
        <div className="flex flex-col">
            <button
                className="flex justify-center items-center w-48 h-10 button-M-outline-il rounded-lg border-2 border-color-greyScale/300 gap-2"
                type="button"
                onClick={socialLoginHandlers[socialType]}
            >
                {socialType === 'discord' && <DiscordLogo style={{ color: '#464646' }} />}
                {socialType === 'google' && <GoogleLogo style={{ color: '#464646' }} />}
                <p className="font-XS-bold text-color-greyScale/800">{title}</p>
            </button>
        </div>
    );
}
