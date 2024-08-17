'use client';
import React from 'react';
import DiscordLogo from '../../../assets/icons/social-midia/discord.svg';
import GoogleLogo from '../../../assets/icons/social-midia/google.svg';

type SocialLoginButtonProps = {
    title: string;
    socialType: 'discord' | 'google';
};

export default function SocialLoginButton({ title, socialType }: SocialLoginButtonProps) {
    const handleSocialLogin = () => {
        console.log('Register ~ SocialLoginButton ~ handleSocialLogin: ', socialType);
    };
    return (
        <button
            className="flex justify-center items-center w-48 h-10 button-M-outline-il rounded-lg border-2 border-color-greyScale/300 gap-2"
            type="button"
            onClick={handleSocialLogin}
        >
            {socialType === 'discord' && <DiscordLogo style={{ color: '#464646' }} />}
            {socialType === 'google' && <GoogleLogo style={{ color: '#464646' }} />}
            <p className="font-XS-bold text-color-greyScale/800">{title}</p>
        </button>
    );
}
