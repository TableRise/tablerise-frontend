'use client';
import { useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import TableriseContext from '@/context/TableriseContext';
import DiscordLogo from '@assets/icons/social-midia/discord.svg?url';
import LinkedinLogo from '@assets/icons/social-midia/linkedin.svg?url';
import TwitchLogo from '@assets/icons/social-midia/twitch.svg?url';
import XLogo from '@assets/icons/social-midia/x.svg?url';
import InstagramLogo from '@assets/icons/social-midia/instagram.svg?url';
import GitHubLogo from '@assets/icons/social-midia/github.svg?url';
import LightModeLogo from '@assets/icons/light-dark-mode/light-mode-sun.svg?url';
import DarkModeLogo from '@assets/icons/light-dark-mode/dark-mode-moon.svg?url';
import '@/components/home/styles/Footer.css';

export default function Footer(): JSX.Element {
    const { darkModeOn, setDarkModeOn } = useContext(TableriseContext);

    const handleDarkModeChange = () => {
        setDarkModeOn(!darkModeOn);
    };

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
                    <Link href="/">
                        <Image
                            src={DiscordLogo}
                            alt="Discord Logo"
                            className="logo discord"
                        />
                    </Link>
                    <Link href="/">
                        <Image
                            src={LinkedinLogo}
                            alt="Linkedin Logo"
                            className="logo linkedin"
                        />
                    </Link>
                    <Link href="/">
                        <Image src={XLogo} alt="X Logo" className="logo-X" />
                    </Link>
                    <Link href="/">
                        <Image
                            src={InstagramLogo}
                            alt="Instagram Logo"
                            className="logo instagram"
                        />
                    </Link>
                    <Link href="/">
                        <Image
                            src={TwitchLogo}
                            alt="Twitch Logo"
                            className="logo twitch"
                        />
                    </Link>
                </div>

                <div className="footer-links">
                    <ul>
                        <h5>Links Rápidos</h5>
                        <li>
                            <Link href="/">Sobre</Link>
                        </li>
                        <li>
                            <Link href="/">FAQ</Link>
                        </li>
                        <li>
                            <Link href="/">Tutorial</Link>
                        </li>
                    </ul>
                </div>
                <div className="footer-links">
                    <ul>
                        <h5>Outros</h5>
                        <li>
                            <Link href="/">Termos de serviço</Link>
                        </li>
                        <li>
                            <Link href="/">Políticas de privacidade</Link>
                        </li>
                        <li>
                            <Link href="/">Configurações de cookies</Link>
                        </li>
                        <li>
                            <Link href="/">supporte</Link>
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
                        onChange={handleDarkModeChange}
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
