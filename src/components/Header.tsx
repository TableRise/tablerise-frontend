import Image from 'next/image';
import TableRiseLightMark from '../../assets/icons/logo.svg?url';
import '@/components/styles/Header.css';

const alts = require('../../assets/alts');

export default function Header(): JSX.Element {
    return (
        <header>
            <Image
                src={TableRiseLightMark}
                alt={alts.tablerise_logo_alt_txt}
                className="logo-header"
            />
            <div className="menu-and-buttons">
                <nav className="menu">
                    <ul className="menu-list font-XS-bold">
                        <li>Inicio</li>
                        <li>Tutorial</li>
                        <li>Sobre</li>
                    </ul>
                </nav>
                <div className="buttons-header">
                    <button className="font-XS-bold button-transparent-default">
                        Entrar
                    </button>
                    <button className="font-XS-bold button-white-default">
                        Registrar
                    </button>
                </div>
            </div>
        </header>
    );
}
