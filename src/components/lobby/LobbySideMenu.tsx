'use client';
import Image from 'next/image';
import SheetSVG from '../../../assets/icons/menu-panel-lobby/sheet.svg?url';
import ParticipantsSVG from '../../../assets/icons/menu-panel-lobby/participants.svg?url';
import PostSVG from '../../../assets/icons/menu-panel-lobby/post.svg?url';
import ExitRedSVG from '../../../assets/icons/sys/exit-red.svg?url';
import HistorySVG from '../../../assets/icons/menu-panel-lobby/history.svg?url';
import SettingsSVG from '../../../assets/icons/menu-panel-lobby/settings.svg?url';
import MediaSVG from '../../../assets/icons/menu-panel-lobby/media.svg?url';
import '@/components/lobby/styles/LobbySideMenu.css';

interface LobbySideMenuProps {
    isPlayer: boolean;
    isMaster: boolean;
    onMenuAction?: (key: string) => void;
}

const playerMenuItems = [
    { key: 'create-sheet', icon: SheetSVG, label: 'Criar/Editar Ficha de Personagem' },
    { key: 'participants', icon: ParticipantsSVG, label: 'Ver Participantes' },
    { key: 'new-post', icon: PostSVG, label: 'Criar Novo Post' },
    { key: 'leave', icon: ExitRedSVG, label: 'Sair da Campanha', danger: true },
];

const masterExtraItems = [
    { key: 'history', icon: HistorySVG, label: 'Histórico de partidas' },
    { key: 'edit-settings', icon: SettingsSVG, label: 'Editar Configurações' },
];

export default function LobbySideMenu({
    isPlayer,
    isMaster,
    onMenuAction,
}: LobbySideMenuProps): JSX.Element {
    const baseItems = playerMenuItems.filter((item) => item.key !== 'leave');
    const leaveItem = playerMenuItems.find((item) => item.key === 'leave')!;

    let menuItems: typeof playerMenuItems = [];
    if (isMaster) {
        menuItems = [...baseItems, ...masterExtraItems, leaveItem];
    } else if (isPlayer) {
        menuItems = playerMenuItems;
    }

    return (
        <aside className="lobby-side-menu">
            <nav className="lobby-side-menu-nav">
                {menuItems.map((item) => (
                    <div key={item.key} className="lobby-menu-item-wrapper">
                        <span
                            className={`lobby-menu-label font-XS-bold ${
                                item.danger ? 'lobby-menu-label-danger' : ''
                            }`}
                        >
                            {item.label}
                        </span>
                        <button
                            className={`lobby-menu-item ${
                                item.danger ? 'lobby-menu-item-danger' : ''
                            }`}
                            onClick={() => onMenuAction?.(item.key)}
                        >
                            <Image
                                src={item.icon}
                                alt={item.label}
                                width={32}
                                height={32}
                            />
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
