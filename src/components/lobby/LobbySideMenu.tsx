'use client';
import { useContext, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import TableriseContext from '@/context/TableriseContext';
import SheetSVG from '../../../assets/icons/menu-panel-lobby/sheet.svg?url';
import SheetDarkSVG from '../../../assets/icons/menu-panel-lobby/sheet-dark.svg?url';
import ParticipantsSVG from '../../../assets/icons/menu-panel-lobby/participants.svg?url';
import ParticipantsDarkSVG from '../../../assets/icons/menu-panel-lobby/participants-dark.svg?url';
import PostSVG from '../../../assets/icons/menu-panel-lobby/post.svg?url';
import PostDarkSVG from '../../../assets/icons/menu-panel-lobby/post-dark.svg?url';
import ExitRedSVG from '../../../assets/icons/sys/exit-red.svg?url';
import HistorySVG from '../../../assets/icons/menu-panel-lobby/history.svg?url';
import HistoryDarkSVG from '../../../assets/icons/menu-panel-lobby/history-dark.svg?url';
import SettingsSVG from '../../../assets/icons/menu-panel-lobby/settings.svg?url';
import SettingsDarkSVG from '../../../assets/icons/menu-panel-lobby/settings-dark.svg?url';
import PlaySVG from '../../../assets/icons/menu-panel-lobby/play.svg?url';
import PlayDarkSVG from '../../../assets/icons/menu-panel-lobby/play-dark.svg?url';
import ShoppingBlueSVG from '../../../assets/icons/menu-panel-lobby/shopping-blue.svg?url';
import ShoppingDarkSVG from '../../../assets/icons/menu-panel-lobby/shopping-dark.svg?url';
import ArrowRightBlueSVG from '../../../assets/icons/nav/arrow-right-blue.svg?url';
import ArrowRightDarkSVG from '../../../assets/icons/nav/arrow-right-dark.svg?url';
import '@/components/lobby/styles/LobbySideMenu.css';

interface LobbySideMenuProps {
    isPlayer: boolean;
    isMaster: boolean;
    shopEnabled?: boolean;
    onMenuAction?: (key: string) => void;
}

export default function LobbySideMenu({
    isPlayer,
    isMaster,
    shopEnabled = true,
    onMenuAction,
}: LobbySideMenuProps): JSX.Element {
    const { themeMode } = useContext(TableriseContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isDarkMode = themeMode === 'dark';
    const arrowIcon = isDarkMode ? ArrowRightDarkSVG : ArrowRightBlueSVG;

    const playerMenuItems = useMemo(
        () => [
            {
                key: 'play-match',
                icon: isDarkMode ? PlayDarkSVG : PlaySVG,
                label: 'Entrar na Partida',
            },
            {
                key: 'create-sheet',
                icon: isDarkMode ? SheetDarkSVG : SheetSVG,
                label: 'Criar/Editar Ficha de Personagem',
            },
            {
                key: 'participants',
                icon: isDarkMode ? ParticipantsDarkSVG : ParticipantsSVG,
                label: 'Ver Participantes',
            },
            {
                key: 'new-post',
                icon: isDarkMode ? PostDarkSVG : PostSVG,
                label: 'Criar Novo Post',
            },
            {
                key: 'shop',
                icon: isDarkMode ? ShoppingDarkSVG : ShoppingBlueSVG,
                label: 'Loja de Equipamentos',
            },
            {
                key: 'leave',
                icon: ExitRedSVG,
                label: 'Sair da Campanha',
                danger: true,
            },
        ],
        [isDarkMode]
    );

    const masterExtraItems = useMemo(
        () => [
            {
                key: 'history',
                icon: isDarkMode ? HistoryDarkSVG : HistorySVG,
                label: 'Histórico de partidas',
            },
            {
                key: 'edit-settings',
                icon: isDarkMode ? SettingsDarkSVG : SettingsSVG,
                label: 'Editar Configurações',
            },
        ],
        [isDarkMode]
    );

    const baseItems = playerMenuItems.filter((item) => item.key !== 'leave');
    const leaveItem = playerMenuItems.find((item) => item.key === 'leave')!;

    let menuItems: typeof playerMenuItems = [];
    if (isMaster) {
        menuItems = [...baseItems, ...masterExtraItems, leaveItem];
    } else if (isPlayer) {
        menuItems = [...baseItems, leaveItem];
    }

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <aside
            className={`lobby-side-menu${
                isMobileMenuOpen ? ' lobby-side-menu--mobile-open' : ''
            }`}
        >
            <button
                type="button"
                className="lobby-side-menu-mobile-toggle"
                aria-label={
                    isMobileMenuOpen
                        ? 'Fechar menu da campanha'
                        : 'Abrir menu da campanha'
                }
                aria-expanded={isMobileMenuOpen}
                aria-controls="lobby-side-menu-nav"
                onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
                <Image
                    src={arrowIcon}
                    alt=""
                    className={`lobby-side-menu-mobile-toggle-icon${
                        isMobileMenuOpen
                            ? ' lobby-side-menu-mobile-toggle-icon--open'
                            : ''
                    }`}
                    width={24}
                    height={24}
                    aria-hidden="true"
                />
            </button>
            <nav className="lobby-side-menu-nav" id="lobby-side-menu-nav">
                {menuItems.map((item) => {
                    const isDisabled = item.key === 'shop' && !shopEnabled;

                    return (
                        <div key={item.key} className="lobby-menu-item-wrapper">
                            <span
                                className={`lobby-menu-label font-XS-bold ${
                                    item.danger ? 'lobby-menu-label-danger' : ''
                                }`}
                            >
                                {item.label}
                            </span>
                            <button
                                type="button"
                                className={`lobby-menu-item ${
                                    item.danger ? 'lobby-menu-item-danger' : ''
                                } ${isDisabled ? 'lobby-menu-item-disabled' : ''}`}
                                onClick={() => {
                                    if (isDisabled) return;
                                    onMenuAction?.(item.key);
                                    setIsMobileMenuOpen(false);
                                }}
                                disabled={isDisabled}
                            >
                                <Image
                                    src={item.icon}
                                    alt={item.label}
                                    width={32}
                                    height={32}
                                />
                                <span
                                    className={`lobby-menu-item-mobile-label font-XS-bold ${
                                        item.danger
                                            ? 'lobby-menu-item-mobile-label-danger'
                                            : ''
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </button>
                        </div>
                    );
                })}
                {menuItems.length === 0 && (
                    <span className="font-XS-regular text-color-greyScale/500">
                        Sem opções disponíveis
                    </span>
                )}
            </nav>
        </aside>
    );
}
