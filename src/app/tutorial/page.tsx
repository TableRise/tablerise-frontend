import { v4 as uuid } from 'uuid';
import MainCard from '@/components/common/MainCard';
import { cards } from '@/app/tutorial/data';
import '@/app/tutorial/styles/page.css';

export default function Tutorial(): JSX.Element {
    return (
        <section className="tutorial-page">
            <section className="tutorial-inside-container">
                <header>
                    <h2 className="font-XXL-bold">Tutorial</h2>
                    <span>
                        Adicione imagens, personagens, trilhas sonoras e muitas outras
                        funções disponíveis dentro de sua sessão!
                    </span>
                </header>
                <div className="tutorial-cards">
                    {cards.map((card) => (
                        <MainCard
                            key={uuid()}
                            title={card.title}
                            textColor={card.textColor}
                            buttonColor={card.buttonColor}
                            fogColor={card.fogColor}
                            size={card.size}
                        />
                    ))}
                </div>
            </section>
        </section>
    );
}
