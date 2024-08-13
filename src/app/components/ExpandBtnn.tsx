import React from 'react';
import Image from 'next/image';
import expand from '../../../assets/icons/nav/add-16.svg';
import colapse from '../../../assets/icons/nav/reduce.svg';

type ExpandButtonProps = {
    handler: () => void,
    expandState: boolean
}

export default function ExpandBtn({ handler, expandState }: ExpandButtonProps) {
    return (
        <button
        className='border border-[#bdbdbd] rounded-[4px] w-6 h-6 flex items-center justify-center'
        onClick={ handler }
    >
        <Image
            src={ expandState ? colapse : expand }
            alt='More details'
        />
    </button>
    )
}
