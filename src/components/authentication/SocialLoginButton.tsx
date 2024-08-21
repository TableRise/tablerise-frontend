'use client';
import React from 'react';
import DiscordLogo from '../../../assets/icons/social-midia/discord.svg';
import GoogleLogo from '../../../assets/icons/social-midia/google.svg';
import { getGoogleLogin, getDiscordLogin } from '@/server/users/api';
import { useRouter } from 'next/navigation';
import '@/components/authentication/styles/SocialLoginButton.css';

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
        <div className="button-container">
            <button
                className="social-button button-M-outline-il"
                type="button"
                onClick={socialLoginHandlers[socialType]}
            >
                {socialType === 'discord' && <DiscordLogo style={{ color: '#464646' }} />}
                {socialType === 'google' && <GoogleLogo style={{ color: '#464646' }} />}
                <p className="button-text font-XS-bold">{title}</p>
            </button>
        </div>
    );
}
