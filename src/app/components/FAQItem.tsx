'use client'
import React, { useState } from 'react';
import ExpandBtn from './ExpandBtnn';

export default function FAQItem() {
    const [expand, setExpand] = useState<boolean>(false);

    function handleFAQItem(): void {
        setExpand(!expand);
    }

    return (
        <li className='w-full bg-[#292929] p-4 rounded-xl flex flex-col gap-3'>
            <div className='w-full flex justify-between'>
                <h2 className='font-L-semibold'>Title</h2>
                <ExpandBtn handler={ handleFAQItem } expandState={ expand } />
            </div>
            <p hidden={ !expand }>Answer</p>
        </li>
    )

}
