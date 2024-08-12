import React from 'react';
import Image from 'next/image';
import more from '../../../assets/icons/nav/add-16.svg'

export default function FAQItem() {
    return (
        <li className='bg-[#292929] flex p-4 justify-between rounded-xl'>
            <h2 className='font-L-semibold'>Title</h2>
            <button className='border border-[#bdbdbd] rounded-[4px] w-6 h-6 flex items-center justify-center'>
                <Image
                    src={ more }
                    alt='More details'
                />
            </button>
        </li>
    )

}
