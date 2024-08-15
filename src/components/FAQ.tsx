import React from 'react';
import FAQItem from '@/components/FAQItem';
import MoreDetailsBtn from '@/components/MoreDetailsBtn';
import { questions } from '@/utils/faqQuestions';

export default function FAQ() {
    return (
        <section className='bg-[#141414] text-color-greyScale/50 font-M-regular'>
            <h1 className='py-4 font-XL-bold'>Perguntas frequentes</h1>
            <ul className='flex flex-col gap-3'>
                { questions.map(({ question, answer }, index) => (
                    <FAQItem
                        key={ `faq-question-${index}` }
                        question={ question }
                        answer={ answer }
                    />
                )) }
            </ul>
            <div className='py-4 flex items-center gap-6 text-color-greyScale/100'>
                <p>Ainda com dúvidas?</p>
                <MoreDetailsBtn />
            </div>
        </section>
    )
}
