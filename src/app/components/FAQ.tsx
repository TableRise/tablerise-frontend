import React from 'react';
import FAQItem from './FAQItem';
import VerMais from './VerMais';

export default function FAQ() {
    // Question bank
    const questions = [
        { question: 'O que é TableRise?', answer: 'É uma plataforma VTT (Virtual Table Top) para jogar RPG online com amigos.' },
        { question: 'TableRise é pago?', answer: 'Nâo, todas nossas funcionalidades são gratuitas.' },
        { question: 'Quais modos de jogo existem?', answer: 'Em um primeiro momento é possível jogar apenas D&D e sem precisar adquirir um livro, porém já está planejado desenvolvermos um modo mais geral, que se encaixa com qualquer sistema de RPG.' },
        { question: 'O conteúdo do D&D é original da Wizard?', answer: 'Por sermos um projeto sem fins lucrativos utilizamos o conteúdo disponibilizado pela Wizard para utilização gratuita (CC), porém o conteúdo do SRD da Wizard não é suficiente para uma campanha real, por isso em alguns pontos nos do TableRise tomamos a liberdade de adicionarmos alguns conteúdos autorais. A proporção é de 70% WIzard para 30% TableRise.' },
    ];

    return (
        // The whole container
        <section className='text-white bg-[#141414] font-M-regular'>
            <h1 className='py-4 font-XL-bold'>Perguntas frequentes</h1>
            { /* Where questions are being iterated and rendered as FAQItem components */ }
            <ul className='flex flex-col gap-3'>
                { questions.map(({ question, answer }, index) => (
                    <FAQItem
                        key={ index }
                        question={ question }
                        answer={ answer }
                    />
                    )) }
            </ul>
            { /* Last container with a button to more FAQ questions */ }
            <div className='py-4 flex items-center gap-6'>
                <p>Ainda com dúvidas?</p>
                <VerMais />
            </div>
        </section>
    )
}
