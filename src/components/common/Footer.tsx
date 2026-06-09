'use client';
import { useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import TableriseContext from '@/context/TableriseContext';
import GitHubLogo from '@assets/icons/social-midia/github.svg?url';
import LightModeLogo from '@assets/icons/light-dark-mode/light-mode-sun.svg?url';
import DarkModeLogo from '@assets/icons/light-dark-mode/dark-mode-moon.svg?url';
import '@/components/common/styles/Footer.css';

export default function Footer(): JSX.Element {
    const { themeMode, toggleThemeMode } = useContext(TableriseContext);

    return (
        <footer className="footer">
            <div className="footer-media-links">
                <div className="social-media-icons">
                    <Link href="https://github.com/TableRise">
                        <Image
                            src={GitHubLogo}
                            alt="GitHub Logo"
                            className="logo github"
                        />
                    </Link>
                </div>

                <div className="footer-links">
                    <h5>Links Rapidos</h5>
                    <ul>
                        <li>
                            <Link href="/about">Sobre</Link>
                        </li>
                        <li>
                            <Link href="/tutorial">Tutorial</Link>
                        </li>
                    </ul>
                </div>
                <div className="footer-links">
                    <h5>Outros</h5>
                    <ul>
                        <li>
                            <Link href="/terms">Termos de serviço</Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p className="copy-right">
                    &copy; 2024 TableRise. Todos os direitos reservados
                </p>
                <p className="artist">
                    Designed By{' '}
                    <Link
                        href="https://matheusilva.art/"
                        target="_blank"
                        className="matheus-link "
                    >
                        matheusilva.art
                    </Link>
                </p>
                <div className="theme-toggle">
                    <span className="theme-toggle-label">Tema</span>
                    <input
                        type="checkbox"
                        id="darkmode-toggle"
                        checked={themeMode === 'dark'}
                        onChange={toggleThemeMode}
                    />
                    <label htmlFor="darkmode-toggle" className="label-darkmode-toggle">
                        <Image
                            src={LightModeLogo}
                            alt="Light Mode Logo"
                            className="light-mode-logo"
                        />
                        <Image
                            src={DarkModeLogo}
                            alt="Dark Mode Logo"
                            className="dark-mode-logo"
                        />
                    </label>
                </div>
            </div>
        </footer>
    );
}
