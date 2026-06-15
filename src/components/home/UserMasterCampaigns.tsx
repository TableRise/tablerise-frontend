'use client';
import { useState } from 'react';
import type { CampaignPlayerStatusLike } from '@/components/home/helpers/campaignPlayerStatus';
import CampaignCard from '@/components/common/CampaignCard';
import BasicCreationCard from '@/components/common/BasicCreationCard';
import CreateCampaignModal from '@/components/home/CreateCampaignModal';
import CampaignPasswordModal from '@/components/home/CampaignPasswordModal';
import DonationSupportModal from '@/components/home/DonationSupportModal';
import ErrorModal from '@/components/home/ErrorModal';
import LoadingDots from '@/components/common/LoadingDots';
import type { UserCampaign } from '@/types/modules/context/TableriseContext';
import '@/components/home/styles/UserMasterCampaigns.css';
import { shouldSkipDonationPrompt } from '@/components/home/helpers/donationPromptPreference';
import { useJoinCampaign } from '@/components/home/helpers/useJoinCampaign';

type UserMasterCampaignsProps = {
    campaigns: UserCampaign[];
    isCampaignsLoading?: boolean;
};

export default function UserMasterCampaigns({
    campaigns,
    isCampaignsLoading = false,
}: UserMasterCampaignsProps): JSX.Element {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [donationModalOpen, setDonationModalOpen] = useState(false);
    const [donationModalMode, setDonationModalMode] = useState<'create' | 'join'>(
        'create'
    );
    const [pendingDonationAction, setPendingDonationAction] = useState<
        (() => void | Promise<void>) | null
    >(null);
    const openCreateModal = () => setCreateModalOpen(true);
    const closeCreateModal = () => setCreateModalOpen(false);
    const {
        handleJoinClick,
        passwordModalOpen,
        passwordError,
        handlePasswordConfirm,
        closePasswordModal,
        joinError,
        closeJoinError,
    } = useJoinCampaign();

    const openDonationGate = (
        mode: 'create' | 'join',
        action: () => void | Promise<void>
    ) => {
        if (shouldSkipDonationPrompt()) {
            void action();
            return;
        }

        setDonationModalMode(mode);
        setPendingDonationAction(() => action);
        setDonationModalOpen(true);
    };

    const handleCreateIntent = () => {
        openDonationGate('create', openCreateModal);
    };

    const handleCardJoinIntent = (
        campaignId: string,
        campaignPlayers: CampaignPlayerStatusLike[]
    ) => {
        openDonationGate('join', () => handleJoinClick(campaignId, campaignPlayers));
    };

    const handleDonationConfirm = async () => {
        const nextAction = pendingDonationAction;

        setDonationModalOpen(false);
        setPendingDonationAction(null);

        await nextAction?.();
    };

    return (
        <section className="user-master-campaigns">
            <div className="user-master-campaigns-header">
                <div className="user-master-campaigns-created-label">
                    <span className="label-title font-L-semibold">Criadas por você</span>
                    <div className="creation-limits font-XS-regular">
                        <span>Limite de criação</span>
                        <span>{campaigns.length}/2</span>
                    </div>
                </div>
                <div className="user-master-campaigns-buttons">
                    <button
                        className="button-L-fill font-XS-bold"
                        disabled={campaigns.length >= 2}
                        onClick={handleCreateIntent}
                    >
                        Criar uma campanha
                    </button>
                </div>
            </div>

            <div className="user-master-campaigns-cards">
                {campaigns.length > 0 && (
                    <CampaignCard
                        className={'embla__slide'}
                        key={campaigns[0].campaignId}
                        title={campaigns[0].title}
                        nextMatchDate={campaigns[0].infos.nextMatchDate}
                        fogColor="#0A358A"
                        image={campaigns[0].cover?.link}
                        textColor="white"
                        size="large"
                        buttonColor="white"
                        buttonTitle="Entrar no Jogo"
                        system={campaigns[0].system}
                        ageRestriction={campaigns[0].ageRestriction}
                        campaignPlayers={campaigns[0].campaignPlayers}
                        playerAmountLimit={campaigns[0].infos.playerAmountLimit}
                        campaignId={campaigns[0].campaignId}
                        onButtonClick={() =>
                            handleCardJoinIntent(
                                campaigns[0].campaignId,
                                campaigns[0].campaignPlayers
                            )
                        }
                    />
                )}
                {campaigns.length > 1 ? (
                    <CampaignCard
                        className={'embla__slide'}
                        key={campaigns[1].campaignId}
                        title={campaigns[1].title}
                        nextMatchDate={campaigns[1].infos.nextMatchDate}
                        fogColor="#0A358A"
                        image={campaigns[1].cover?.link}
                        textColor="white"
                        buttonColor="white"
                        buttonTitle="Entrar no Jogo"
                        system={campaigns[1].system}
                        ageRestriction={campaigns[1].ageRestriction}
                        campaignPlayers={campaigns[1].campaignPlayers}
                        playerAmountLimit={campaigns[1].infos.playerAmountLimit}
                        campaignId={campaigns[1].campaignId}
                        onButtonClick={() =>
                            handleCardJoinIntent(
                                campaigns[1].campaignId,
                                campaigns[1].campaignPlayers
                            )
                        }
                    />
                ) : (
                    <>
                        {isCampaignsLoading ? (
                            <div
                                className="basic-creation-card"
                                style={{ width: '22.5rem', height: '22.5rem' }}
                            >
                                <button
                                    type="button"
                                    className="basic-add-button"
                                    disabled
                                    aria-label="Carregando campanhas"
                                >
                                    <LoadingDots label="Carregando campanhas" />
                                </button>
                            </div>
                        ) : (
                            <BasicCreationCard onClick={handleCreateIntent} />
                        )}
                    </>
                )}
            </div>

            {donationModalOpen && (
                <DonationSupportModal
                    mode={donationModalMode}
                    onConfirm={handleDonationConfirm}
                    onClose={() => setDonationModalOpen(false)}
                />
            )}

            {createModalOpen && (
                <CreateCampaignModal
                    onClose={closeCreateModal}
                    onSuccess={closeCreateModal}
                />
            )}

            {passwordModalOpen && (
                <CampaignPasswordModal
                    onConfirm={handlePasswordConfirm}
                    onClose={closePasswordModal}
                    error={passwordError}
                />
            )}

            {joinError && <ErrorModal message={joinError} onClose={closeJoinError} />}
        </section>
    );
}
