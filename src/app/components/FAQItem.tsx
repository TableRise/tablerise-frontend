'use client';
import React, { useState } from 'react';
import ExpandBtn from './ExpandBtnn';

type FAQItemProps = {
    question: string,
    answer: string
}

export default function FAQItem({ question, answer }: FAQItemProps) {
    // State used to determine wheter the answer is showing or not
    const [expand, setExpand] = useState<boolean>(false);

    // Function used to change the state according to the current state value.
    function handleFAQItem(): void {
        setExpand(!expand);
    }

    return (
        <li className='w-full bg-[#292929] p-4 rounded-xl flex flex-col gap-2'>
            { /* The whole question container, divided into two */ }

            <div className='w-full flex justify-between'>
                { /* Contains the FAQ question and the expand button */ }
                <h2 className='font-L-semibold'>{ question }</h2>
                <ExpandBtn handler={ handleFAQItem } expandState={ expand } />
            </div>

            <div hidden={ !expand } className='bg-color-greyScale/900 p-3 rounded-lg'>
                { /* Contains the FAQ answer and start with a hidden property set to false. It changes whenever the expand button is clicked */ }
                <p>{ answer }</p>
            </div>
        </li>
    )

}
