import '@/components/home/styles/Banner.css';

export default function Banner(): JSX.Element {
    return (
        <section className="banner-home">
            <div className="main-text">
                <p className="font-XXL-bold">
                    Bem vindos ao TableRise!
                    <br />
                    Sua ferramenta favorita de RPG de Mesa
                </p>
                <p className="font-M-regular">
                    Crie e jogue suas histórias de maneira
                    <br />
                    prática e descomplicada
                </p>
                <button className="button-white-default font-S-bold">Registrar-se</button>
            </div>
            <div className="main-image" />
        </section>
    );
}
