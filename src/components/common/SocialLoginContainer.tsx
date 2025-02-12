'use client';
import React from 'react';
import SocialLoginButton from './SocialLoginButton';
import './styles/SocialLoginContainer.css';

export default function SocialLoginContainer(): JSX.Element {

    return (
        <div className="social-container">
            <div className="buttons-container">
                <SocialLoginButton title="Discord" socialType={'discord'} />
                <SocialLoginButton title="Google" socialType={'google'} />
            </div>
        </div>
    );
}
