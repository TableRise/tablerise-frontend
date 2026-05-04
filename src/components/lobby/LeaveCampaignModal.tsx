'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { leaveCampaign, transferDungeonMaster } from '@/server/campaigns/join-campaign';
import { getCampaignPlayers } from '@/server/campaigns/get-campaign-players';
import { getUser } from '@/server/users/get-user';

interface Props {
    campaignId: string;
    isMaster: boolean;
    onClose: () => void;
}

export default function LeaveCampaignModal({
    campaignId,
    isMaster,
    onClose,
}: Props): JSX.Element {
    const router = useRouter();

    // Leave state
    const [leaving, setLeaving] = useState(false);
    const [leaveError, setLeaveError] = useState('');

    // Transfer state
    const [players, setPlayers] = useState<{ userId: string; nickname: string }[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [transferring, setTransferring] = useState(false);
    const [transferred, setTransferred] = useState(false);
    const [transferError, setTransferError] = useState('');

    useEffect(() => {
        if (!isMaster) return;
        (async () => {
            try {
                const raw = await getCampaignPlayers(campaignId);
                const others = raw.filter((p) => p.role !== 'dungeon_master');
                const options = await Promise.all(
                    others.map(async (p) => {
                        try {
                            const user = await getUser(p.userId);
                            return {
                                userId: p.userId,
                                nickname: user?.nickname ?? user?.username ?? p.userId,
                            };
                        } catch {
                            return { userId: p.userId, nickname: p.userId };
                        }
                    })
                );
                setPlayers(options);
            } catch {
                // keep empty
            }
        })();
    }, [campaignId, isMaster]);

    async function handleTransfer() {
        if (!selectedUserId) return;
        setTransferError('');
        setTransferring(true);
        try {
            await transferDungeonMaster(campaignId, selectedUserId);
            setTransferred(true);
        } catch (err: any) {
            setTransferError(err.message ?? 'Erro ao transferir função');
        } finally {
            setTransferring(false);
        }
    }

    async function handleLeave() {
        setLeaveError('');
        setLeaving(true);
        try {
            await leaveCampaign(campaignId);
            router.push('/');
        } catch (err: any) {
            setLeaveError(err.message ?? 'Erro ao sair da campanha');
            setLeaving(false);
        }
    }

    return (
        <div className="ecm-backdrop" onClick={onClose}>
            <div
                className="ecm-modal"
                style={{ maxWidth: '28rem' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="ecm-header">
                    <h2 className="font-L-semibold ecm-title">Sair da Campanha</h2>
                    <button
                        className="ecm-close-btn"
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

                <div className="ecm-body">
                    {isMaster && players.length > 0 && (
                        <div className="ecm-fields">
                            <p className="font-XS-regular text-color-greyScale/700">
                                Você é o Mestre da campanha. Antes de sair, transfira a
                                função para outro jogador.
                            </p>

                            <label className="ecm-field">
                                <span className="font-S-bold ecm-field-label">
                                    Transferir função de Mestre
                                </span>
                                <select
                                    className="input-default-light ecm-select"
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    disabled={transferred || transferring}
                                >
                                    <option value="">Selecione um jogador</option>
                                    {players.map((p) => (
                                        <option key={p.userId} value={p.userId}>
                                            {p.nickname}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {transferred ? (
                                <div className="flex items-center gap-2 text-green-600">
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                    <span className="font-S-regular">
                                        Função mestre transferida
                                    </span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className={`font-S-bold button-L-fill ecm-btn-save ${
                                        !selectedUserId || transferring
                                            ? 'bg-color-greyScale/300 text-color-greyScale/500'
                                            : 'bg-color-primary/default_900 text-color-greyScale/50'
                                    }`}
                                    onClick={handleTransfer}
                                    disabled={!selectedUserId || transferring}
                                >
                                    {transferring
                                        ? 'Transferindo...'
                                        : 'Transferir Mestre'}
                                </button>
                            )}

                            {transferError && (
                                <p className="font-XXS-regular ecm-error">
                                    {transferError}
                                </p>
                            )}
                        </div>
                    )}

                    <p className="font-XS-regular text-color-greyScale/700">
                        {isMaster && players.length > 0
                            ? 'Após a transferência, você pode sair da campanha.'
                            : 'Tem certeza que deseja sair desta campanha?'}
                    </p>

                    {leaveError && (
                        <p className="font-XXS-regular ecm-error mt-3">{leaveError}</p>
                    )}
                </div>

                <div className="ecm-footer">
                    <button
                        type="button"
                        className="font-S-bold ecm-btn-ghost"
                        onClick={onClose}
                        disabled={leaving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className={`font-S-bold button-L-fill ecm-btn-save ${
                            isMaster && players.length > 0 && !transferred
                                ? 'bg-color-greyScale/300 text-color-greyScale/500'
                                : 'bg-red-600 text-white'
                        }`}
                        onClick={handleLeave}
                        disabled={
                            (isMaster && players.length > 0 && !transferred) || leaving
                        }
                    >
                        {leaving ? 'Saindo...' : 'Sair da Campanha'}
                    </button>
                </div>
            </div>
        </div>
    );
}
