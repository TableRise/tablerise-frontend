import Image from 'next/image';
import React from 'react';

type SocialLoginButtonProps = {
    title: string;
    imageSrc: string;
};

export default function SocialLoginButton({ title, imageSrc }: SocialLoginButtonProps) {
    return (
        <button type="button">
            {title}
            <Image src={imageSrc} alt={`${title} logo`} />
        </button>
    );
}
