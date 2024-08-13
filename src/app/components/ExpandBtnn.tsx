import React from 'react';
import Image from 'next/image';
import more from '../../../assets/icons/nav/add-16.svg';

type ExpandButtonProps = {
    handler: () => void
}

export default function ExpandBtn({ handler }: ExpandButtonProps) {
    return (
        <button
        className='border border-[#bdbdbd] rounded-[4px] w-6 h-6 flex items-center justify-center'
        onClick={ handler }
    >
        <Image
            src={ more }
            alt='More details'
        />
    </button>
    )
}
