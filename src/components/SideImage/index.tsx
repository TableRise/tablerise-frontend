import Image from 'next/image';
import React from 'react';
import tableriseLogo from '../../../public/images/LogoTablerise.svg';

export default function SideImage() {
    return (
        <article className="bg-side-image-background absolute w-2/3 h-full left-0 top-0">
            <div className=" absolute opacity-70 w-full h-full left-0 top-0 bg-gradient-to-r from-color-primary/default_900 to-color-primary/950"></div>
            <Image
                src={tableriseLogo}
                alt="Tablerise logo"
                className="absolute w-96 m-auto left-0 right-0 top-0 bottom-0"
            />
        </article>
    );
}
