'use client';
import React, { useState } from 'react';
import ExpandBtn from '@/components/ExpandBtn';
import { FAQItemProps } from '@/types/modules/app/components/FAQItem';

export default function FAQItem({ question, answer }: FAQItemProps) {
    const [expand, setExpand] = useState<boolean>(false);

    function handleFAQItem(): void {
        setExpand(!expand);
    }

    return (
        <li className='w-full bg-color-greyScale/950 p-4 rounded-xl flex flex-col gap-2'>

            <div className='w-full flex justify-between'>
                <h2 className='font-L-semibold'>{ question }</h2>
                <ExpandBtn handler={ handleFAQItem } expandState={ expand } />
            </div>

            { expand && (
                <div className='bg-color-greyScale/900 p-3 rounded-lg'>
                    <p>{ answer }</p>
                </div>
            )}
        </li>
    )

}
