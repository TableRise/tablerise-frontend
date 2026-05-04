'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import TableRiseLightMark from '@assets/icons/logo.svg?url';
import AccountBox from '@assets/icons/social/account-box.svg?url';
import AccountBoxBlue from '@assets/icons/social/account-box-blue.svg?url';
import ExpandMore from '@assets/icons/nav/expand-more.svg?url';
import SettingsIcon from '@assets/icons/sys/settings-blue.svg?url';
import HelpIcon from '@assets/icons/sys/help-blue.svg?url';
import ExitIcon from '@assets/icons/sys/exit-red.svg?url';
import { postLogout } from '@/server/users/logout';
import Link from 'next/link';
import '@/components/common/styles/LoggedHeader.css';

const alts = require('@assets/alts');

export default function LoggedHeader(): JSX.Element {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    async function handleLogout() {
        setOpen(false);
        await postLogout();
        localStorage.removeItem('userLogged');
        router.push('/login');
    }

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="logged-header">
            <Link href="/">
                <Image
                    src={TableRiseLightMark}
                    alt={alts.tablerise_logo_alt_txt}
                    className="logo-header"
                />
            </Link>

            <div className="menu-and-buttons-logged" ref={ref}>
                <nav className="logged-header-nav">
                    <ul className="font-XS-bold">
                        <li>
                            <Link href="/">Campanhas</Link>
                        </li>
                        <li>
                            <Link href="/tutorial">Tutorial</Link>
                        </li>
                    </ul>
                </nav>
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
                            onClick={() => setOpen(false)}
                        >
                            <Image
                                src={AccountBoxBlue}
                                alt="perfil"
                                width={20}
                                height={20}
                            />
                            <span className="font-S-regular">Perfil</span>
                        </Link>
                        <Link
                            href="/settings"
                            className="logged-header-dropdown-item"
                            onClick={() => setOpen(false)}
                        >
                            <Image
                                src={SettingsIcon}
                                alt="configurações"
                                width={20}
                                height={20}
                            />
                            <span className="font-S-regular">Configurações</span>
                        </Link>
                        <Link
                            href="/support"
                            className="logged-header-dropdown-item"
                            onClick={() => setOpen(false)}
                        >
                            <Image src={HelpIcon} alt="suporte" width={20} height={20} />
                            <span className="font-S-regular">Suporte</span>
                        </Link>
                        <button
                            type="button"
                            className="logged-header-dropdown-item logged-header-dropdown-item--danger"
                            onClick={handleLogout}
                        >
                            <Image src={ExitIcon} alt="deslogar" width={20} height={20} />
                            <span className="font-S-bold">Deslogar</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
