'use client';
import React from 'react';
import DiscordLogo from '../../../assets/icons/social-midia/discord.svg';
import GoogleLogo from '../../../assets/icons/social-midia/google.svg';
import { getGoogleLogin, getDiscordLogin } from '@/server/users/api';
import { useRouter } from 'next/navigation';
import '@/components/authentication/styles/SocialLoginButton.css';
import { SocialLoginButtonProps } from '@/types/modules/components/authentication/SocialLoginButton';
import Link from 'next/link';

export default function SocialLoginButton({
    title,
    socialType,
}: SocialLoginButtonProps): JSX.Element {
    const router = useRouter();

    return (
        <div className="button-container">
            <Link href={`${process.env.API_OAUTH}/${socialType}`}>
                <button className="social-button button-M-outline-il" type="button">
                    {socialType === 'discord' && (
                        <DiscordLogo style={{ color: '#464646' }} />
                    )}
                    {socialType === 'google' && (
                        <GoogleLogo style={{ color: '#464646' }} />
                    )}
                    <p className="button-text font-XS-bold">{title}</p>
                </button>
            </Link>
        </div>
    );
}
