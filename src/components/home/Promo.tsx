import '@/components/home/styles/Promo.css';

export default function Promo(): JSX.Element {
    return (
        <section className="promo-section">
            <div className="promo-text">
                <h2 className="font-XL-bold">Crie uma campanha única</h2>
                <p className="font-M-regular">
                    Junte seus amigos e embarque nessa jornada!
                    <br />
                    Com o TableRise, fica mais fácil a interação Mestre-Jogador.
                </p>
            </div>
            <div className="promo-image" />
        </section>
    );
}
