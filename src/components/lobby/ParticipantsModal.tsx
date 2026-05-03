'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    getCampaignPlayers,
    type CampaignPlayer,
} from '@/server/campaigns/get-campaign-players';
import { getCharacterById } from '@/server/characters/get-characters';
import { getUser } from '@/server/users/get-user';
import '@/components/lobby/styles/ParticipantsModal.css';

interface ParticipantsModalProps {
    campaignId: string;
    onClose: () => void;
}

interface PlayerCard {
    userId: string;
    nickname: string;
    picture: string;
    characterName: string;
    role: string;
}

const ROLE_LABEL: Record<string, string> = {
    player: 'Jogador',
    dungeon_master: 'Mestre',
    admin_player: 'Administrador(a)',
};

export default function ParticipantsModal({
    campaignId,
    onClose,
}: ParticipantsModalProps): JSX.Element {
    const router = useRouter();
    const [players, setPlayers] = useState<PlayerCard[]>([]);
    const [loading, setLoading] = useState(true);

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
                                picture = user.picture?.link ?? picture;
                                nickname = user.nickname ?? nickname;
                            }
                        } catch {
                            // keep defaults
                        }

                        return {
                            userId: p.userId,
                            nickname,
                            picture,
                            characterName,
                            role: p.role,
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
        <div className="pm-overlay" onClick={onClose}>
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
                            Carregando participantes...
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
                                        <span className="font-XXS-regular pm-char-name">
                                            {player.characterName}
                                        </span>
                                        <span className="font-XXS-regular pm-role">
                                            {ROLE_LABEL[player.role] ?? player.role}
                                        </span>
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
    );
}
