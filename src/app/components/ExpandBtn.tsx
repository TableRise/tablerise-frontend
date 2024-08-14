import React from 'react';
import Image from 'next/image';
import expand from '../../../assets/icons/nav/add-16.svg';
import reduce from '../../../assets/icons/nav/reduce.svg';

type ExpandBtnProps = {
    handler: () => void,
    expandState: boolean
}

export default function ExpandBtn({ handler, expandState }: ExpandBtnProps) {
    return (
        <button
            className='border border-color-greyScale/300 rounded-[4px] w-6 h-6 flex items-center justify-center'
            onClick={ handler }
        >
        <Image
            src={ expandState ? reduce : expand }
            alt='More details'
        />
        </button>
    )
}
