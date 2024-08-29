import '@/components/home/styles/Footer.css';
import Image from 'next/image';
import Link from 'next/link';
import DiscordLogo from '../../../assets/icons/social-midia/discord.svg';
import FacebookLogo from '../../../assets/icons/social-midia/facebook.svg';
import LinkedinLogo from '../../../assets/icons/social-midia/linkedin.svg';
import TwitchLogo from '../../../assets/icons/social-midia/twitch.svg';
import XLogo from '../../../assets/icons/social-midia/x.svg';
import InstagramLogo from '../../../assets/icons/social-midia/instagram.svg';
import GoogleLogo from '../../../assets/icons/social-midia/google.svg';
import GitHubLogo from '../../../assets/icons/social-midia/github.svg';

export default function Footer(): JSX.Element {
    return (
        <footer className="footer">
            <div className="footer-media-links">
                <div className="social-media-icons">
                    <Link href="/">
                        <Image
                            src={DiscordLogo}
                            alt="Discord Logo"
                            className="logo-discord"
                        />
                    </Link>
                    <Link href="/">
                        <Image
                            src={FacebookLogo}
                            alt="Facebook Logo"
                            className="logo-facebook"
                        />
                    </Link>
                    <Link href="/">
                        <Image
                            src={LinkedinLogo}
                            alt="Linkedin Logo"
                            className="logo-linkedin"
                        />
                    </Link>
                    <Link href="/">
                        <Image
                            src={TwitchLogo}
                            alt="Twitch Logo"
                            className="logo-twitch"
                        />
                    </Link>
                    <Link href="/">
                        <Image src={XLogo} alt="X Logo" className="logo-X" />
                    </Link>
                    <Link href="/">
                        <Image
                            src={InstagramLogo}
                            alt="Instagram Logo"
                            className="logo-instagram"
                        />
                    </Link>
                    <Link href="/">
                        <Image
                            src={GoogleLogo}
                            alt="Google Logo"
                            className="logo-google"
                        />
                    </Link>
                    <Link href="https://github.com/TableRise">
                        <Image
                            src={GitHubLogo}
                            alt="GitHub Logo"
                            className="logo-github"
                        />
                    </Link>
                </div>

                <div className="footer-links">
                    <ul>
                        <h5>Links Rápidos</h5>
                        <li>
                            <a href="#" className="hover:text-gray-400">
                                Sobre
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-gray-400">
                                FAQ
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-gray-400">
                                Tutorial
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="footer-links">
                    <ul>
                        <h5>Outros</h5>
                        <li>
                            <a href="#" className="hover:text-gray-400">
                                Termos de serviço
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-gray-400">
                                Políticas de privacidade
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-gray-400">
                                Configurações de cookies
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-gray-400">
                                Suporte
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2024 TableRise. Todos os direitos reservados</p>
                <p>
                    Designed By{' '}
                    <a href="#" className="hover:underline">
                        matheusilva.art
                    </a>
                </p>
                <div className="theme-toggle">
                    <span className="theme-toggle-label">Tema</span>
                    <label className="theme-switch">
                        <input type="checkbox" className="sr-only peer"></input>
                        <div></div>
                    </label>
                </div>
            </div>
        </footer>
    );
}
