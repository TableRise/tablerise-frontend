import FAQItem from '@/components/FAQItem';
import MoreDetailsBtn from '@/components/MoreDetailsBtn';
import { questions } from '@/utils/faqQuestions';
import '@/components/styles/FAQ.css';

export default function FAQ() {
    return (
        <section className='faq-container font-M-regular'>
            <h1 className='faq-title font-XL-bold'>Perguntas frequentes</h1>
            <ul className='faq-question-list'>
                { questions.map(({ question, answer }, index) => (
                    <FAQItem
                        key={ `faq-question-${index}` }
                        question={ question }
                        answer={ answer }
                    />
                )) }
            </ul>
            <div className='faq-extra'>
                <p>Ainda com dúvidas?</p>
                <MoreDetailsBtn />
            </div>
        </section>
    )
}
