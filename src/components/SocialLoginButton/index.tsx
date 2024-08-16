import React from 'react';

type SocialLoginButtonProps = {
    title: string;
    Icon: any;
};

export default function SocialLoginButton({ title, Icon }: SocialLoginButtonProps) {
    return (
        <button
            className="flex justify-center items-center w-48 h-10 button-M-outline-il rounded-lg border-2 border-color-greyScale/300 gap-2"
            type="button"
        >
            <Icon style={{ color: '#464646' }} />
            <p className="font-XS-bold text-color-greyScale/800">{title}</p>
        </button>
    );
}
