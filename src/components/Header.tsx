<<<<<<< HEAD
import Image from 'next/image';
import Link from 'next/link';
import TableRiseLightMark from '../../assets/icons/logo.svg';
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
                        <li>
                            <Link href="/">Inicio</Link>
                        </li>
                        <li>
                            <Link href="/guide">Tutorial</Link>
                        </li>
                        <li>
                            <Link href="/about">Sobre</Link>
                        </li>
                    </ul>
                </nav>
                <div className="buttons-header">
                    <Link href="/login">
                        <button className="font-XS-bold button-transparent-default">
                            Entrar
                        </button>
                    </Link>
                    <Link href="/register">
                        <button className="font-XS-bold button-white-default">
                            Registrar
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
=======
import Image from 'next/image';
import TableRiseLightMark from '../../assets/icons/logo.svg?url';
import Link from 'next/link';
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
                        <li>
                            <Link href="/">Inicio</Link>
                        </li>
                        <li>
                            <Link href="/guide">Tutorial</Link>
                        </li>
                        <li>
                            <Link href="/about">Sobre</Link>
                        </li>
                    </ul>
                </nav>
                <div className="buttons-header">
                    <Link href="/login">
                        <button className="font-XS-bold button-transparent-default">
                            Entrar
                        </button>
                    </Link>
                    <Link href="/register">
                        <button className="font-XS-bold button-white-default">
                            Registrar
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
>>>>>>> develop
