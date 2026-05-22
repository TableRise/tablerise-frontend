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
    return (
        <div className="button-container">
            <Link
                href={`${process.env.API_OAUTH}/${socialType}`}
                className="social-button-link"
            >
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
