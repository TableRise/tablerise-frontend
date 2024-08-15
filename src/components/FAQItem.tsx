'use client';
import { useState } from 'react';
import ExpandBtn from '@/components/ExpandBtn';
import { FAQItemProps } from '@/types/modules/components/FAQItem';

export default function FAQItem({ question, answer }: FAQItemProps) {
    const [expand, setExpand] = useState<boolean>(false);

    function handleFAQItem(): void {
        setExpand(!expand);
    }

    return (
        <li className='faq-item-container'>
            <div className='faq-item-question'>
                <h2 className='font-L-semibold'>{ question }</h2>
                <ExpandBtn handler={ handleFAQItem } expandState={ expand } />
            </div>
            { expand && (
                <div className='faq-item-answer'>
                    <p>{ answer }</p>
                </div>
            )}
        </li>
    )

}
