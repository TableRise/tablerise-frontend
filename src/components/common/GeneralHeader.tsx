'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import TableRiseLightMark from '@assets/icons/logo.svg?url';
import MenuSVG from '@assets/icons/nav/menu.svg?url';
import CloseSVG from '@assets/icons/nav/close.svg?url';
import Link from 'next/link';
import '@/components/common/styles/GeneralHeader.css';

const alts = require('@assets/alts');

export default function GeneralHeader(): JSX.Element {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth > 768) {
                setMenuOpen(false);
            }
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMenu = () => setMenuOpen((current) => !current);
    const closeMenu = () => setMenuOpen(false);

    return (
        <header
            className={`general-header${menuOpen ? ' general-header--menu-open' : ''}`}
        >
            <Link href="/" onClick={closeMenu}>
                <Image
                    src={TableRiseLightMark}
                    alt={alts.tablerise_logo_alt_txt}
                    className="logo-header"
                    priority
                />
            </Link>

            <button
                type="button"
                className="general-header-mobile-toggle"
                aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={menuOpen}
                onClick={toggleMenu}
            >
                <Image
                    src={menuOpen ? CloseSVG : MenuSVG}
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden="true"
                />
            </button>

            <div
                className={`menu-and-buttons${menuOpen ? ' menu-and-buttons--open' : ''}`}
            >
                <nav className="menu">
                    <ul className="menu-list font-XS-bold">
                        <li>
                            <Link href="/" onClick={closeMenu}>
                                Inicio
                            </Link>
                        </li>
                        <li>
                            <Link href="/tutorial" onClick={closeMenu}>
                                Tutorial
                            </Link>
                        </li>
                        <li>
                            <Link href="/about" onClick={closeMenu}>
                                Sobre
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div className="buttons-header">
                    <Link
                        href="/login"
                        onClick={closeMenu}
                        className="font-XS-bold button-transparent-default"
                    >
                        Entrar
                    </Link>
                    <Link
                        href="/register"
                        onClick={closeMenu}
                        className="font-XS-bold button-white-default"
                    >
                        Registrar
                    </Link>
                </div>
            </div>
        </header>
    );
}
