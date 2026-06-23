'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LoadingDots from '@/components/common/LoadingDots';
import {
    getCampaignPlayers,
    confirmCampaignPlayer,
    removeCampaignPlayer,
    type CampaignPlayer,
} from '@/server/campaigns/get-campaign-players';
import { getCharacterById } from '@/server/characters/get-characters';
import { getProfileTitleTextStyle } from '@/components/profile/profilePageHelpers';
import { getUser } from '@/server/users/get-user';
import '@/components/lobby/styles/ParticipantsModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';
import { getResolvedUserTitle } from '@/utils/userTitle';

interface ParticipantsModalProps {
    campaignId: string;
    isMaster: boolean;
    currentUserId: string;
    onParticipantsChanged?: () => void | Promise<void>;
    onClose: () => void;
}

interface PlayerCard {
    userId: string;
    nickname: string;
    picture: string;
    title: string;
    titleType: string;
    characterName: string;
    role: string;
    status: string;
}

const ROLE_LABEL: Record<string, string> = {
    player: 'Jogador',
    dungeon_master: 'Mestre',
    admin_player: 'Administrador(a)',
};

export default function ParticipantsModal({
    campaignId,
    isMaster,
    currentUserId,
    onParticipantsChanged,
    onClose,
}: ParticipantsModalProps): JSX.Element {
    useBodyScrollLock();
    const router = useRouter();
    const [players, setPlayers] = useState<PlayerCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

    const handleRemoveConfirm = async () => {
        if (!pendingRemoveId) return;
        setRemovingId(pendingRemoveId);
        setPendingRemoveId(null);
        try {
            await removeCampaignPlayer(campaignId, pendingRemoveId);
            setPlayers((prev) => prev.filter((p) => p.userId !== pendingRemoveId));
            await onParticipantsChanged?.();
        } finally {
            setRemovingId(null);
        }
    };

    const handleConfirm = async (userId: string) => {
        setConfirmingId(userId);
        try {
            await confirmCampaignPlayer(campaignId, userId);
            setPlayers((prev) =>
                prev.map((p) => (p.userId === userId ? { ...p, status: 'active' } : p))
            );
            await onParticipantsChanged?.();
        } finally {
            setConfirmingId(null);
        }
    };

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const rawPlayers: CampaignPlayer[] = await getCampaignPlayers(campaignId);

                const cards = await Promise.all(
                    rawPlayers.map(async (p) => {
                        let characterName = '—';
                        let nickname = '';
                        let picture = '/images/SideImageBackground.svg';
                        let title = '';
                        let titleType = '';

                        if (p.characterIds.length > 0) {
                            try {
                                const char = await getCharacterById(p.characterIds[0]);
                                if (char) {
                                    characterName = char.data.profile.name;
                                    nickname = char.author.nickname;
                                }
                            } catch {
                                // keep defaults
                            }
                        }

                        try {
                            const user = await getUser(p.userId);
                            if (user) {
                                const resolvedTitle = getResolvedUserTitle(user);
                                picture = user.picture?.link ?? picture;
                                nickname = user.nickname ?? nickname;
                                title = resolvedTitle.title;
                                titleType = resolvedTitle.titleType;
                            }
                        } catch {
                            // keep defaults
                        }

                        return {
                            userId: p.userId,
                            nickname,
                            picture,
                            title,
                            titleType,
                            characterName,
                            role: p.role,
                            status: p.status,
                        };
                    })
                );

                setPlayers(cards);
            } finally {
                setLoading(false);
            }
        })();
    }, [campaignId]);

    return (
        <>
            {pendingRemoveId && (
                <div className="pm-remove-overlay">
                    <div
                        className="pm-remove-dialog"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="font-S-bold pm-remove-title">Remover jogador?</p>
                        <p className="font-XS-regular pm-remove-body">
                            Tem certeza que deseja remover este jogador da campanha?
                        </p>
                        <div className="pm-remove-actions">
                            <button
                                className="pm-remove-cancel font-XS-bold"
                                onClick={() => setPendingRemoveId(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="pm-remove-confirm font-XS-bold"
                                onClick={handleRemoveConfirm}
                            >
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="pm-overlay">
                <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
                    {/* ── Header ───────────────────────────── */}
                    <div className="pm-header">
                        <h2 className="font-L-bold pm-title">Participantes</h2>
                        <button
                            className="pm-close-btn"
                            onClick={onClose}
                            aria-label="Fechar"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* ── Grid ─────────────────────────────── */}
                    {loading ? (
                        <div className="pm-loading">
                            <span className="font-XS-regular">
                                <LoadingDots label="Carregando participantes" />
                            </span>
                        </div>
                    ) : (
                        <div className="pm-grid">
                            {players.map((player) => (
                                <div key={player.userId} className="pm-card">
                                    <div className="pm-card-body">
                                        <div className="pm-avatar">
                                            <Image
                                                src={player.picture}
                                                alt={player.nickname}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="pm-card-info">
                                            <span className="font-S-bold pm-nickname">
                                                {player.nickname}
                                            </span>
                                            {player.title ? (
                                                <span
                                                    className="font-XXS-bold pm-user-title"
                                                    style={getProfileTitleTextStyle(
                                                        player.titleType
                                                    )}
                                                >
                                                    {player.title}
                                                </span>
                                            ) : null}
                                            <span className="font-XXS-regular pm-char-name">
                                                {player.characterName}
                                            </span>
                                            <span className="font-XXS-regular pm-role">
                                                {ROLE_LABEL[player.role] ?? player.role}
                                            </span>
                                            {player.status !== 'active' ? (
                                                <span className="font-XXS-regular pm-pending">
                                                    Pendente de Aprovação do Mestre
                                                </span>
                                            ) : (
                                                <span className="font-XXS-regular pm-confirmed">
                                                    Participante confirmado.
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pm-card-footer">
                                        <button
                                            className="pm-profile-btn font-XS-bold"
                                            onClick={() =>
                                                router.push(`/profile/${player.userId}`)
                                            }
                                        >
                                            Ver perfil
                                        </button>
                                        {isMaster &&
                                            currentUserId === player.userId &&
                                            player.role === 'dungeon_master' && (
                                                <span
                                                    className="pm-confirm-btn-placeholder font-XS-bold"
                                                    aria-hidden="true"
                                                >
                                                    Remover Jogador
                                                </span>
                                            )}
                                        {isMaster &&
                                            !(
                                                currentUserId === player.userId &&
                                                player.role === 'dungeon_master'
                                            ) && (
                                                <button
                                                    className="pm-confirm-btn font-XS-bold"
                                                    disabled={
                                                        confirmingId === player.userId ||
                                                        removingId === player.userId
                                                    }
                                                    onClick={() =>
                                                        player.status !== 'active'
                                                            ? handleConfirm(player.userId)
                                                            : setPendingRemoveId(
                                                                  player.userId
                                                              )
                                                    }
                                                >
                                                    {confirmingId === player.userId ||
                                                    removingId === player.userId
                                                        ? 'Processando...'
                                                        : player.status !== 'active'
                                                        ? 'Aceitar Jogador'
                                                        : 'Remover Jogador'}
                                                </button>
                                            )}
                                    </div>
                                </div>
                            ))}
                            {players.length === 0 && (
                                <p className="pm-empty font-XS-regular">
                                    Nenhum participante encontrado.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
