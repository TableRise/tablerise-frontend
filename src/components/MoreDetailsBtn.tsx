import React from 'react';
import Image from 'next/image';
import add from '../../../assets/icons/nav/arrow-right.svg'

export default function MoreDetailsBtn() {
    return (
        <button className='flex pl-4 pr-2 gap-2 h-[40px] items-center border-solid border-white border rounded-lg font-XS-bold'>
            Ver mais
            <Image
                alt='Ver mais'
                src={ add }
            />
        </button>
    )
}
