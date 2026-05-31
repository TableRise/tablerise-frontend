'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import TrashSVG from '../../../assets/icons/sys/trash.svg?url';
import {
    getCharactersByPlayer,
    getCharactersByCampaignLobby,
    type CampaignCharacter,
} from '@/server/characters/get-characters';
import LoadingDots from '@/components/common/LoadingDots';
import { removeCharacterFromCampaign } from '@/server/characters/create-character';
import CharacterDetailModal from '@/components/lobby/CharacterDetailModal';
import '@/components/lobby/styles/CharacterSheetModal.css';

interface CharacterSheetModalProps {
    campaignId: string;
    userId: string;
    isPlayer: boolean;
    isMaster: boolean;
    xpSystem: boolean;
    onClose: () => void;
}

function formatSheetDate(dateString: string): string {
    if (!dateString) return '';
    const cleaned = dateString.replace(/"/g, '');
    const [datePart] = cleaned.split('T');
    const [year, month, day] = datePart.split('-');
    return `${day}-${month}-${year}`;
}

export default function CharacterSheetModal({
    campaignId,
    userId,
    isPlayer,
    isMaster,
    xpSystem,
    onClose,
}: CharacterSheetModalProps): JSX.Element {
    const router = useRouter();
    const [myChars, setMyChars] = useState<CampaignCharacter[]>([]);
    const [playerChars, setPlayerChars] = useState<CampaignCharacter[]>([]);
    const [characters, setCharacters] = useState<CampaignCharacter[]>([]);
    const [activeTab, setActiveTab] = useState<'mine' | 'players'>('mine');
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!confirmDeleteId) return;
        setDeletingId(confirmDeleteId);
        setConfirmDeleteId(null);
        try {
            await removeCharacterFromCampaign(campaignId, confirmDeleteId);
            if (isMaster) {
                setMyChars((prev) => prev.filter((c) => c.id !== confirmDeleteId));
                setPlayerChars((prev) => prev.filter((c) => c.id !== confirmDeleteId));
            } else {
                setCharacters((prev) => prev.filter((c) => c.id !== confirmDeleteId));
            }
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        if (isMaster) {
            getCharactersByCampaignLobby(campaignId)
                .then((data) => {
                    setMyChars(data.filter((c) => c.authorUserId === userId));
                    setPlayerChars(data.filter((c) => c.authorUserId !== userId));
                })
                .finally(() => setLoading(false));
        } else {
            getCharactersByPlayer(campaignId)
                .then((data) => {
                    if (isPlayer) {
                        setCharacters(data.filter((c) => c.authorUserId === userId));
                    } else {
                        setCharacters(data);
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [campaignId, userId, isPlayer, isMaster]);

    const displayChars = isMaster
        ? activeTab === 'mine'
            ? myChars
            : playerChars
        : characters;

    return (
        <>
            <div className="csm-overlay">
                <div className="csm-modal" onClick={(e) => e.stopPropagation()}>
                    <h2 className="font-L-semibold csm-title">Gerenciamento de Fichas</h2>

                    {isMaster && (
                        <div className="csm-tabs">
                            <button
                                type="button"
                                className={`csm-tab font-XS-bold${
                                    activeTab === 'mine' ? ' csm-tab--active' : ''
                                }`}
                                onClick={() => setActiveTab('mine')}
                            >
                                Minhas Fichas
                            </button>
                            <button
                                type="button"
                                className={`csm-tab font-XS-bold${
                                    activeTab === 'players' ? ' csm-tab--active' : ''
                                }`}
                                onClick={() => setActiveTab('players')}
                            >
                                Fichas dos Jogadores
                            </button>
                        </div>
                    )}

                    <div className="csm-list">
                        {loading && (
                            <span className="font-XS-regular csm-loading">
                                <LoadingDots label="Carregando fichas" />
                            </span>
                        )}

                        {!loading && displayChars.length === 0 && (
                            <span className="font-XS-regular csm-empty">
                                Nenhuma ficha encontrada
                            </span>
                        )}

                        {!loading &&
                            displayChars.map((char) => (
                                <div
                                    key={char.id}
                                    className="csm-card"
                                    onClick={() => setSelectedCharId(char.id)}
                                >
                                    <div className="csm-card-left">
                                        <div className="csm-card-icon">
                                            <Image
                                                src={
                                                    char.image ||
                                                    '/images/SideImageBackground.svg'
                                                }
                                                alt={char.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="csm-card-info">
                                            <span className="font-XS-bold">
                                                Ficha de Personagem
                                            </span>
                                            <span className="font-XXS-regular csm-card-name">
                                                {char.name}
                                            </span>
                                            <span className="font-XXS-regular csm-card-date">
                                                Data de criação:{' '}
                                                {formatSheetDate(char.createdAt)}
                                            </span>
                                            <span className="font-XXS-regular csm-card-date">
                                                Data da ultima atualização:{' '}
                                                {formatSheetDate(char.updatedAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="csm-card-delete"
                                        disabled={deletingId === char.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmDeleteId(char.id);
                                        }}
                                    >
                                        <Image
                                            src={TrashSVG}
                                            alt="Excluir"
                                            width={24}
                                            height={24}
                                        />
                                    </button>
                                </div>
                            ))}
                    </div>

                    <button
                        type="button"
                        className="button-L-fill bg-color-primary/default_900 text-color-greyScale/50"
                        onClick={() =>
                            router.push(
                                `/campaigns/character-sheet?campaignId=${campaignId}`
                            )
                        }
                    >
                        Criar Nova Ficha de Personagem
                    </button>

                    <button
                        type="button"
                        className="font-S-bold csm-cancel-btn"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </div>

            {selectedCharId && (
                <CharacterDetailModal
                    characterId={selectedCharId}
                    campaignId={campaignId}
                    isMaster={isMaster}
                    xpSystem={xpSystem}
                    onBack={() => setSelectedCharId(null)}
                />
            )}

            {confirmDeleteId && (
                <div
                    className="csm-confirm-overlay"
                    onClick={() => setConfirmDeleteId(null)}
                >
                    <div
                        className="csm-confirm-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="font-M-bold csm-confirm-title">Excluir ficha</h3>
                        <p className="font-XS-regular csm-confirm-text">
                            Tem certeza que deseja excluir esta ficha? Esta ação não pode
                            ser desfeita.
                        </p>
                        <div className="csm-confirm-actions">
                            <button
                                type="button"
                                className="csm-confirm-btn-cancel font-XS-bold"
                                onClick={() => setConfirmDeleteId(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="csm-confirm-btn-delete font-XS-bold bg-color-primary/default_900"
                                onClick={handleDelete}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
