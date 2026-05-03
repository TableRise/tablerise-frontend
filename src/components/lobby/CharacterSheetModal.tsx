'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import FichaSVG from '../../../assets/icons/sys/ficha.svg?url';
import TrashSVG from '../../../assets/icons/sys/trash.svg?url';
import {
    getCharactersByCampaign,
    type CharacterDnd,
} from '@/server/characters/get-characters';
import { removeCharacterFromCampaign } from '@/server/characters/create-character';
import CharacterDetailModal from '@/components/lobby/CharacterDetailModal';
import '@/components/lobby/styles/CharacterSheetModal.css';

interface CharacterSheetModalProps {
    campaignId: string;
    userId: string;
    isPlayer: boolean;
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
    onClose,
}: CharacterSheetModalProps): JSX.Element {
    const router = useRouter();
    const [characters, setCharacters] = useState<CharacterDnd[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

    const handleDelete = async (e: React.MouseEvent, characterId: string) => {
        e.stopPropagation();
        setDeletingId(characterId);
        try {
            await removeCharacterFromCampaign(campaignId, characterId);
            setCharacters((prev) => prev.filter((c) => c.characterId !== characterId));
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        getCharactersByCampaign(campaignId)
            .then((data) => {
                if (isPlayer) {
                    setCharacters(data.filter((c) => c.author.userId === userId));
                } else {
                    setCharacters(data);
                }
            })
            .finally(() => setLoading(false));
    }, [campaignId, userId, isPlayer]);

    return (
        <>
            <div className="csm-overlay" onClick={onClose}>
                <div className="csm-modal" onClick={(e) => e.stopPropagation()}>
                    <h2 className="font-L-semibold csm-title">Gerenciamento de Fichas</h2>

                    <div className="csm-list">
                        {loading && (
                            <span className="font-XS-regular csm-loading">
                                Carregando fichas...
                            </span>
                        )}

                        {!loading && characters.length === 0 && (
                            <span className="font-XS-regular csm-empty">
                                Nenhuma ficha encontrada
                            </span>
                        )}

                        {!loading &&
                            characters.map((char) => (
                                <div
                                    key={char.characterId}
                                    className="csm-card"
                                    onClick={() => setSelectedCharId(char.characterId)}
                                >
                                    <div className="csm-card-left">
                                        <div className="csm-card-icon">
                                            <Image
                                                src={FichaSVG}
                                                alt="Ficha"
                                                width={60}
                                                height={60}
                                            />
                                        </div>
                                        <div className="csm-card-info">
                                            <span className="font-XS-bold">
                                                Ficha de Personagem
                                            </span>
                                            <span className="font-XXS-regular csm-card-name">
                                                {char.profile?.name ?? 'Sem nome'}
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
                                        disabled={deletingId === char.characterId}
                                        onClick={(e) => handleDelete(e, char.characterId)}
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
                    onBack={() => setSelectedCharId(null)}
                />
            )}
        </>
    );
}
