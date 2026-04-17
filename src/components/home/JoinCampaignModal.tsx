'use client';
import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import CampaignCard from '@/components/common/CampaignCard';
import CampaignPasswordModal from '@/components/home/CampaignPasswordModal';
import ErrorModal from '@/components/home/ErrorModal';
import { searchCampaigns } from '@/server/campaigns/search-campaigns';
import { useJoinCampaign } from '@/components/home/helpers/useJoinCampaign';
import '@/components/home/styles/JoinCampaignModal.css';

interface Props {
    onClose: () => void;
}

export default function JoinCampaignModal({ onClose }: Props): JSX.Element {
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const {
        handleJoinClick,
        passwordModalOpen,
        passwordError,
        handlePasswordConfirm,
        closePasswordModal,
        joinError,
        closeJoinError,
    } = useJoinCampaign();

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
            const all = Array.isArray(data) ? data : [];
            setResults(all.slice(0, 20));
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
                        placeholder="Título da campanha"
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
                                {results.map((campaign) => (
                                    <CampaignCard
                                        key={uuid()}
                                        title={campaign.title}
                                        nextMatchDate={
                                            campaign.infos?.nextMatchDate ?? 'no-date'
                                        }
                                        fogColor="#0A358A"
                                        image={campaign.cover?.link}
                                        textColor="white"
                                        size="medium-large"
                                        buttonColor="white"
                                        buttonTitle="Entrar no Jogo"
                                        system={campaign.system}
                                        ageRestriction={campaign.ageRestriction}
                                        campaignPlayers={campaign.campaignPlayers ?? []}
                                        playerAmountLimit={campaign.playerAmountLimit}
                                        campaignId={campaign.campaignId}
                                        onButtonClick={() =>
                                            handleJoinClick(
                                                campaign.campaignId,
                                                campaign.campaignPlayers ?? []
                                            )
                                        }
                                    />
                                ))}
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
