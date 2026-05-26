'use client';

import { useEffect, useState } from 'react';
import CampaignCard from '@/components/common/CampaignCard';
import ErrorModal from '@/components/home/ErrorModal';
import CampaignPasswordModal from '@/components/home/CampaignPasswordModal';
import { isCampaignPlayerPending } from '@/components/home/helpers/campaignPlayerStatus';
import { useJoinCampaign } from '@/components/home/helpers/useJoinCampaign';
import { getCampaignById } from '@/server/campaigns/join-campaign';
import { searchCampaigns } from '@/server/campaigns/search-campaigns';
import '@/components/home/styles/JoinCampaignModal.css';

interface Props {
    onClose: () => void;
}

function getCampaignNextMatchDate(campaign: any): string {
    const nextMatchDate = campaign.infos?.nextMatchDate ?? campaign.nextMatchDate;
    return nextMatchDate ? nextMatchDate : 'no-date';
}

function getCampaignPlayers(campaign: any): any[] {
    return campaign.campaignPlayers ?? campaign.players ?? [];
}

function getCampaignPlayerAmountLimit(campaign: any): number {
    return campaign.infos?.playerAmountLimit ?? campaign.playerAmountLimit ?? 0;
}

export default function JoinCampaignModal({ onClose }: Props): JSX.Element {
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const currentUserId =
        typeof window === 'undefined'
            ? ''
            : JSON.parse(localStorage.getItem('userLogged') ?? 'null')?.userId ?? '';
    const {
        handleJoinClick,
        passwordModalOpen,
        passwordError,
        handlePasswordConfirm,
        closePasswordModal,
        joinError,
        closeJoinError,
    } = useJoinCampaign({
        onJoinRequested: onClose,
    });

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    async function handleSearch() {
        setSearching(true);
        setSearched(false);
        try {
            const params: { title?: string; code?: string } = {};
            if (title) params.title = title;
            if (code) params.code = code;

            const data = await searchCampaigns(params);
            const all = Array.isArray(data) ? data.slice(0, 20) : [];
            const campaignDetails = await Promise.all(
                all.map(async (campaign) => {
                    const campaignId = campaign?.campaignId;

                    if (!campaignId) return campaign;

                    try {
                        const fullCampaign = await getCampaignById(campaignId);
                        return fullCampaign ? { ...campaign, ...fullCampaign } : campaign;
                    } catch {
                        return campaign;
                    }
                })
            );

            setResults(campaignDetails);
        } catch {
            setResults([]);
        } finally {
            setSearching(false);
            setSearched(true);
        }
    }

    return (
        <div className="jcm-backdrop" onClick={onClose}>
            <div className="jcm-modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="jcm-title font-L-semibold text-color-primary/default_900">
                    Entrar em uma campanha
                </h2>

                <div className="jcm-search-row">
                    <input
                        className="jcm-input-title font-XS-regular"
                        type="text"
                        placeholder="TÃ­tulo da campanha"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <input
                        className="jcm-input-code font-XS-regular"
                        type="text"
                        placeholder="Código"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <button
                        className="jcm-search-btn button-L-fill font-XS-bold"
                        onClick={handleSearch}
                        disabled={searching}
                    >
                        {searching ? 'Buscando...' : 'Pesquisar'}
                    </button>
                </div>

                <div className="jcm-results">
                    {searched && results.length > 0 && (
                        <>
                            <span className="jcm-results-label font-M-semibold text-color-primary/default_900">
                                Campanhas encontradas
                            </span>
                            <div className="jcm-results-cards">
                                {results.map((campaign) => {
                                    const campaignPlayers = getCampaignPlayers(campaign);
                                    const isPending = isCampaignPlayerPending(
                                        campaignPlayers,
                                        currentUserId
                                    );

                                    return (
                                        <CampaignCard
                                            key={campaign.campaignId}
                                            title={campaign.title}
                                            nextMatchDate={getCampaignNextMatchDate(
                                                campaign
                                            )}
                                            fogColor="#0A358A"
                                            image={campaign.cover?.link}
                                            textColor="white"
                                            size="medium-large"
                                            buttonColor="white"
                                            buttonTitle={
                                                isPending
                                                    ? 'Aguardando aprovação \u29d6'
                                                    : 'Entrar no Jogo'
                                            }
                                            buttonDisabled={isPending}
                                            system={campaign.system}
                                            ageRestriction={campaign.ageRestriction}
                                            campaignPlayers={campaignPlayers}
                                            playerAmountLimit={getCampaignPlayerAmountLimit(
                                                campaign
                                            )}
                                            campaignId={campaign.campaignId}
                                            onButtonClick={() =>
                                                handleJoinClick(
                                                    campaign.campaignId,
                                                    campaignPlayers
                                                )
                                            }
                                        />
                                    );
                                })}
                            </div>
                        </>
                    )}
                    {searched && results.length === 0 && (
                        <span className="jcm-no-results font-XS-regular">
                            Nenhuma campanha encontrada
                        </span>
                    )}
                </div>

                <button className="ccm-btn-ghost font-S-bold" onClick={onClose}>
                    Cancelar
                </button>

                {passwordModalOpen && (
                    <CampaignPasswordModal
                        onConfirm={handlePasswordConfirm}
                        onClose={closePasswordModal}
                        error={passwordError}
                    />
                )}

                {joinError && <ErrorModal message={joinError} onClose={closeJoinError} />}
            </div>
        </div>
    );
}
