import MainCard from '@/components/common/MainCard';
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
                    <MainCard
                        title="Campanha"
                        textColor="white"
                        buttonColor="white"
                        fogColor="#0A358A"
                        size="large"
                    />
                    <MainCard title="Ficha" />
                    <MainCard title="Mesa" />
                    <MainCard title="Jogadores" />
                    <MainCard title="Partidas" />
                </div>
            </section>
        </section>
    );
}
