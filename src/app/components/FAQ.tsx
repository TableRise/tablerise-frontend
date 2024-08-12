import React from 'react';
import FAQItem from './FAQItem';
import VerMais from './VerMais';

export default function FAQ() {
    const questions = [{}, {}, {}, {}];

    return (
        <section className='text-white font-M-regular'>
            <h1 className='py-4 font-XL-bold'>Perguntas frequentes</h1>
            <ul className='flex flex-col gap-3'>
                { questions.map((question, index) => <FAQItem key={ index }></FAQItem>) }
            </ul>
            <div className='py-4 flex items-center gap-6'>
                <p>Ainda com dúvidas?</p>
                <VerMais />
            </div>
        </section>
    )
}
