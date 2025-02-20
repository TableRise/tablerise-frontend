import '@/components/home/styles/Banner.css';
import Link from 'next/link';

export default function Banner(): JSX.Element {
    return (
        <section className="banner-home">
            <div className="main-text">
                <p className="font-XXL-bold">
                    Bem vindos ao TableRise!
                    <br />
                    Sua ferramenta favorita para
                    <br /> jogar RPG de Mesa
                </p>
                <p className="font-M-regular">
                    Crie e jogue suas histórias de maneira
                    <br />
                    prática e descomplicada
                </p>
                <Link href="/register">
                    <button className="button-white-default font-S-bold">
                        Registrar-se
                    </button>
                </Link>
            </div>
            <div className="main-image" />
        </section>
    );
}
