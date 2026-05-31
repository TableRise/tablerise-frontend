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
                        Aprenda a configurar campanhas, personagens, mapas, trilhas
                        sonoras e outras funçíµes disponí­veis na sua sessão.
                    </span>
                </header>
                <div className="tutorial-cards">
                    {cards.map((card) => (
                        <MainCard
                            key={card.slug}
                            slug={card.slug}
                            title={card.title}
                            textColor={card.textColor}
                            buttonColor={card.buttonColor}
                            fogColor={card.fogColor}
                            size={card.size}
                            image={card.image}
                        />
                    ))}
                </div>
            </section>
        </section>
    );
}
