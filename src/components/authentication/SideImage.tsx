import Image from 'next/image';
import React from 'react';
import TableriseLogo from '../../../assets/icons/logo.svg?url';
import '@/components/authentication/styles/SideImage.css';

export default function SideImage(): JSX.Element {
    return (
        <article className="article">
            <div className="image-filter"></div>
            <div className="logo-container">
                <Image src={TableriseLogo} alt="Tablerise logo" className="image-logo" />
            </div>
        </article>
    );
}
