'use client';
import Image from 'next/image';
import Link from 'next/link';
import GitHubLogo from '@assets/icons/social-midia/github.svg?url';
import '@/components/common/styles/Footer.css';

export default function Footer(): JSX.Element {
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
                            <Link href="/terms">Termos de Servico</Link>
                        </li>
                        <li>
                            <Link href="/privacy">Politica de Privacidade</Link>
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
            </div>
        </footer>
    );
}
