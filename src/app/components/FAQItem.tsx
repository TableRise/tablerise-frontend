'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import more from '../../../assets/icons/nav/add-16.svg';

export default function FAQItem() {
    const [details, setDetails] = useState<boolean>(false);

    function handleFAQItem(): void {
        setDetails(!details);
    }

    return (
        <li className='w-full bg-[#292929] p-4 rounded-xl'>
            <div className='w-full flex justify-between'>
                <h2 className='font-L-semibold'>Title</h2>
                <button
                    className='border border-[#bdbdbd] rounded-[4px] w-6 h-6 flex items-center justify-center'
                    onClick={ handleFAQItem }
                >
                    <Image
                        src={ more }
                        alt='More details'
                    />
                </button>
            </div>
            <p hidden={ !details }>Answer</p>
        </li>
    )

}
