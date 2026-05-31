'use client';
import { useState } from 'react';
import CampaignCard from '@/components/common/CampaignCard';
import BasicCreationCard from '@/components/common/BasicCreationCard';
import CreateCampaignModal from '@/components/home/CreateCampaignModal';
import CampaignPasswordModal from '@/components/home/CampaignPasswordModal';
import DonationSupportModal from '@/components/home/DonationSupportModal';
import ErrorModal from '@/components/home/ErrorModal';
import { CampaignsToRender } from '@/types/modules/components/home/UserMasterCampaigns';
import '@/components/home/styles/UserMasterCampaigns.css';
import { shouldSkipDonationPrompt } from '@/components/home/helpers/donationPromptPreference';
import { useJoinCampaign } from '@/components/home/helpers/useJoinCampaign';

export default function UserMasterCampaigns({
    campaigns,
}: CampaignsToRender): JSX.Element {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [donationModalOpen, setDonationModalOpen] = useState(false);
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

    const handleCreateIntent = () => {
        if (shouldSkipDonationPrompt()) {
            openCreateModal();
            return;
        }

        setDonationModalOpen(true);
    };

    const handleDonationConfirm = () => {
        setDonationModalOpen(false);
        openCreateModal();
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
                            handleJoinClick(
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
                            handleJoinClick(
                                campaigns[1].campaignId,
                                campaigns[1].campaignPlayers
                            )
                        }
                    />
                ) : (
                    <BasicCreationCard onClick={handleCreateIntent} />
                )}
            </div>

            {donationModalOpen && (
                <DonationSupportModal
                    mode="create"
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
