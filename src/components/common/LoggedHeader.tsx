'use client';
import { useState, useRef, useEffect, useContext } from 'react';
import Image from 'next/image';
import TableRiseLightMark from '@assets/icons/logo.svg?url';
import AccountBox from '@assets/icons/social/account-box.svg?url';
import AccountBoxBlue from '@assets/icons/social/account-box-blue.svg?url';
import AccountBoxDark from '@assets/icons/social/account-box-dark.svg?url';
import ExpandMore from '@assets/icons/nav/expand-more.svg?url';
import MenuSVG from '@assets/icons/nav/menu.svg?url';
import CloseSVG from '@assets/icons/nav/close.svg?url';
import SettingsIcon from '@assets/icons/sys/settings-blue.svg?url';
import HelpIcon from '@assets/icons/sys/help-blue.svg?url';
import HelpDarkIcon from '@assets/icons/sys/help-dark.svg?url';
import ExitIcon from '@assets/icons/sys/exit-red.svg?url';
import TableriseContext from '@/context/TableriseContext';
import { postLogout } from '@/server/users/logout';
import Link from 'next/link';
import '@/components/common/styles/LoggedHeader.css';

const alts = require('@assets/alts');

export default function LoggedHeader(): JSX.Element {
    const { themeMode } = useContext(TableriseContext);
    const [open, setOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const ref = useRef<HTMLElement>(null);

    async function handleLogout() {
        setMenuOpen(false);
        setOpen(false);
        localStorage.removeItem('userLogged');

        try {
            await postLogout();
        } catch {
            // Force a fresh guest render even if the logout request has already expired.
        }

        window.location.replace('/');
    }

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth > 768) {
                setMenuOpen(false);
            }
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const closeMenu = () => setMenuOpen(false);

    return (
        <header
            ref={ref}
            className={`logged-header${menuOpen ? ' logged-header--menu-open' : ''}`}
        >
            <Link href="/" onClick={closeMenu}>
                <Image
                    src={TableRiseLightMark}
                    alt={alts.tablerise_logo_alt_txt}
                    className="logo-header"
                />
            </Link>

            <button
                type="button"
                className="logged-header-mobile-toggle"
                aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
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
                className={`menu-and-buttons-logged${
                    menuOpen ? ' menu-and-buttons-logged--open' : ''
                }`}
            >
                <nav className="logged-header-nav">
                    <ul className="font-XS-bold">
                        <li>
                            <Link href="/" onClick={closeMenu}>
                                Campanhas
                            </Link>
                        </li>
                        <li>
                            <Link href="/tutorial" onClick={closeMenu}>
                                Tutorial
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div className="logged-header-account">
                    <button
                        type="button"
                        className="logged-header-trigger"
                        onClick={() => setOpen((v) => !v)}
                    >
                        <Image src={AccountBox} alt="user icon" />
                        <Image
                            src={ExpandMore}
                            alt="down arrow to show menu"
                            className={`logged-header-chevron${
                                open ? ' logged-header-chevron--open' : ''
                            }`}
                        />
                    </button>

                    {open && (
                        <div className="logged-header-dropdown">
                            <Link
                                href="/profile"
                                className="logged-header-dropdown-item"
                                onClick={() => {
                                    setOpen(false);
                                    closeMenu();
                                }}
                            >
                                <Image
                                    src={
                                        themeMode === 'dark'
                                            ? AccountBoxDark
                                            : AccountBoxBlue
                                    }
                                    alt="perfil"
                                    width={20}
                                    height={20}
                                />
                                <span className="font-S-regular">Perfil</span>
                            </Link>
                            <Link
                                href="/support"
                                className="logged-header-dropdown-item"
                                onClick={() => {
                                    setOpen(false);
                                    closeMenu();
                                }}
                            >
                                <Image
                                    src={themeMode === 'dark' ? HelpDarkIcon : HelpIcon}
                                    alt="suporte"
                                    width={20}
                                    height={20}
                                />
                                <span className="font-S-regular">Suporte</span>
                            </Link>
                            <button
                                type="button"
                                className="logged-header-dropdown-item logged-header-dropdown-item--danger"
                                onClick={handleLogout}
                            >
                                <Image
                                    src={ExitIcon}
                                    alt="deslogar"
                                    width={20}
                                    height={20}
                                />
                                <span className="font-S-bold">Deslogar</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
