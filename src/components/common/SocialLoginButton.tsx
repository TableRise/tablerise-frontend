'use client';
import React from 'react';
import DiscordLogo from '@assets/icons/social-midia/discord.svg';
import GoogleLogo from '@assets/icons/social-midia/google.svg';
import { SocialLoginButtonProps } from '@/types/modules/components/register/SocialLoginButton';
import Link from 'next/link';
import './styles/SocialLoginButton.css';

export default function SocialLoginButton({
    title,
    socialType,
}: SocialLoginButtonProps): JSX.Element {
    const oauthHref = `${process.env.API_OAUTH ?? ''}/${socialType}`;

    return (
        <div className="button-container">
            <Link
                href={oauthHref}
                className="social-button social-button-link button-M-outline-il"
            >
                {socialType === 'discord' && <DiscordLogo style={{ color: '#464646' }} />}
                {socialType === 'google' && <GoogleLogo style={{ color: '#464646' }} />}
                <span className="button-text font-XS-bold">{title}</span>
            </Link>
        </div>
    );
}
