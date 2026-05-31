'use client';
import React from 'react';
import { useContext } from 'react';
import DiscordLogo from '@assets/icons/social-midia/discord.svg';
import GoogleLogo from '@assets/icons/social-midia/google.svg';
import { SocialLoginButtonProps } from '@/types/modules/components/register/SocialLoginButton';
import TableriseContext from '@/context/TableriseContext';
import Link from 'next/link';
import './styles/SocialLoginButton.css';

export default function SocialLoginButton({
    title,
    socialType,
}: SocialLoginButtonProps): JSX.Element {
    const { userLoggedToggle } = useContext(TableriseContext);
    const oauthHref = `${process.env.API_OAUTH ?? ''}/${socialType}`;

    return (
        <div className="button-container">
            <Link
                href={oauthHref}
                className="social-button social-button-link button-M-outline-il"
                onClick={(event) => {
                    if (userLoggedToggle !== 1) return;

                    event.preventDefault();
                    window.location.replace('/');
                }}
            >
                {socialType === 'discord' && <DiscordLogo className="social-icon" />}
                {socialType === 'google' && <GoogleLogo className="social-icon" />}
                <span className="button-text font-XS-bold">{title}</span>
            </Link>
        </div>
    );
}
