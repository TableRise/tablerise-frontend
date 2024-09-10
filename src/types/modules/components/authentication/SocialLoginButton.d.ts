import React from 'react';

export type SocialLoginButtonProps = {
    title: string;
    socialType: 'discord' | 'google';
    setError: React.Dispatch<React.SetStateAction<booblean>>;
};
