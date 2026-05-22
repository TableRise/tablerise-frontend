import '@/components/home/styles/Banner.css';
import Link from 'next/link';

export default function Banner(): JSX.Element {
    return (
        <section className="banner-home">
            <div className="banner-home-content">
                <div className="main-text">
                    <p className="font-XL-bold">
                        Bem vindos ao TableRise!
                        <br /> Sua ferramenta favorita para
                        <br /> jogar RPG de Mesa
                    </p>
                    <p className="font-M-regular">
                        Crie e jogue suas hist&oacute;rias de maneira
                        <br />
                        pr&aacute;tica e descomplicada
                    </p>
                    <Link href="/register">
                        <button className="button-white-default font-S-bold banner-home-cta">
                            Registrar-se
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
