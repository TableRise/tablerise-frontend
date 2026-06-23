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
import { ArrowLeft, ArrowRight } from '@/components/icons/Arrows';

interface LobbySideMenuProps {
    isPlayer: boolean;
    isMaster: boolean;
    shopEnabled?: boolean;
    playEnabled?: boolean;
    onMenuAction?: (key: string) => void;
}

export default function LobbySideMenu({
    isPlayer,
    isMaster,
    shopEnabled = true,
    playEnabled = true,
    onMenuAction,
}: LobbySideMenuProps): JSX.Element {
    const { themeMode } = useContext(TableriseContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;

        return (window.visualViewport?.width ?? window.innerWidth) <= 768;
    });
    const isDarkMode = themeMode === 'dark';

    const playerMenuItems = useMemo(
        () => [
            {
                key: 'play-match',
                icon: isDarkMode ? PlayDarkSVG : PlaySVG,
                label: 'Entrar na Partida',
                disabled: !playEnabled,
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
                disabled: !shopEnabled,
            },
            {
                key: 'leave',
                icon: ExitRedSVG,
                label: 'Sair da Campanha',
                danger: true,
            },
        ],
        [isDarkMode, playEnabled, shopEnabled]
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
        function syncViewportState() {
            const mobileViewport =
                (window.visualViewport?.width ?? window.innerWidth) <= 768;

            setIsMobileViewport(mobileViewport);

            if (!mobileViewport) {
                setIsMobileMenuOpen(false);
            }
        }

        syncViewportState();

        const visualViewport = window.visualViewport;

        window.addEventListener('resize', syncViewportState);
        window.addEventListener('orientationchange', syncViewportState);
        visualViewport?.addEventListener('resize', syncViewportState);

        return () => {
            window.removeEventListener('resize', syncViewportState);
            window.removeEventListener('orientationchange', syncViewportState);
            visualViewport?.removeEventListener('resize', syncViewportState);
        };
    }, []);

    return (
        <aside
            className={`lobby-side-menu${
                isMobileMenuOpen ? ' lobby-side-menu--mobile-open' : ''
            }`}
        >
            {isMobileViewport && (
                <button
                    type="button"
                    className={`lobby-side-menu-mobile-toggle ${
                        !isDarkMode && '!bg-white'
                    }`}
                    aria-label={
                        isMobileMenuOpen
                            ? 'Fechar menu da campanha'
                            : 'Abrir menu da campanha'
                    }
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="lobby-side-menu-nav"
                    onClick={() => setIsMobileMenuOpen((current) => !current)}
                >
                    {isDarkMode ? (
                        isMobileMenuOpen ? (
                            <ArrowRight
                                mode="dark"
                                className="lobby-side-menu-mobile-toggle-icon"
                                width={24}
                                height={24}
                                aria-hidden="true"
                            />
                        ) : (
                            <ArrowLeft
                                mode="dark"
                                className="lobby-side-menu-mobile-toggle-icon"
                                width={24}
                                height={24}
                                aria-hidden="true"
                            />
                        )
                    ) : isMobileMenuOpen ? (
                        <ArrowRight
                            mode="light"
                            className="lobby-side-menu-mobile-toggle-icon"
                            width={24}
                            height={24}
                            aria-hidden="true"
                        />
                    ) : (
                        <ArrowLeft
                            mode="light"
                            className="lobby-side-menu-mobile-toggle-icon"
                            width={24}
                            height={24}
                            aria-hidden="true"
                        />
                    )}
                </button>
            )}
            <nav className="lobby-side-menu-nav" id="lobby-side-menu-nav">
                {menuItems.map((item) => (
                    <div key={item.key} className="lobby-menu-item-wrapper">
                        <span
                            className={`lobby-menu-label font-XS-bold ${
                                item.danger ? 'lobby-menu-label-danger' : ''
                            } ${item.disabled ? 'lobby-menu-label-disabled' : ''}`}
                        >
                            {item.label}
                        </span>
                        <button
                            type="button"
                            className={`lobby-menu-item ${
                                item.danger ? 'lobby-menu-item-danger' : ''
                            } ${item.disabled ? 'lobby-menu-item-disabled' : ''}`}
                            disabled={item.disabled}
                            onClick={() => {
                                if (item.disabled) return;
                                onMenuAction?.(item.key);
                                setIsMobileMenuOpen(false);
                            }}
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
                ))}
                {menuItems.length === 0 && (
                    <span className="font-XS-regular text-color-greyScale/500">
                        Sem opções disponíveis
                    </span>
                )}
            </nav>
        </aside>
    );
}
