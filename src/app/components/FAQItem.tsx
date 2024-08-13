'use client'
import React, { useState } from 'react';
import ExpandBtn from './ExpandBtnn';

export default function FAQItem() {
    const [details, setDetails] = useState<boolean>(false);

    function handleFAQItem(): void {
        setDetails(!details);
    }

    return (
        <li className='w-full bg-[#292929] p-4 rounded-xl flex flex-col gap-3'>
            <div className='w-full flex justify-between'>
                <h2 className='font-L-semibold'>Title</h2>
                <ExpandBtn handler={ handleFAQItem } />
            </div>
            <p hidden={ !details }>Answer</p>
        </li>
    )

}
