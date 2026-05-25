import { v4 as uuid } from 'uuid';
import CampaignCard from '@/components/common/CampaignCard';
import CampaignPasswordModal from '@/components/home/CampaignPasswordModal';
import ErrorModal from '@/components/home/ErrorModal';
import { useJoinCampaign } from '@/components/home/helpers/useJoinCampaign';
import { isCampaignPlayerPending } from '@/components/home/helpers/campaignPlayerStatus';
import { CampaignsToRender } from '@/types/modules/components/home/UserMasterCampaigns';
import Carousel from '../common/Carousel';
import BasicParticipationCard from '../common/BasicParticipationCard';
import '@/components/home/styles/UserPlayerCampaigns.css';

export default function UserPlayerCampaigns({
    campaigns,
    onJoinClick,
}: CampaignsToRender & { onJoinClick?: () => void }): JSX.Element {
    const {
        handleJoinClick,
        passwordModalOpen,
        passwordError,
        handlePasswordConfirm,
        closePasswordModal,
        joinError,
        closeJoinError,
    } = useJoinCampaign();
    const currentUserId =
        typeof window === 'undefined'
            ? ''
            : JSON.parse(localStorage.getItem('userLogged') ?? 'null')?.userId ?? '';

    const cardMap = campaigns.map((campaign) => {
        const isPending = isCampaignPlayerPending(
            campaign.campaignPlayers,
            currentUserId
        );

        return (
            <CampaignCard
                className="embla__slide"
                key={uuid()}
                title={campaign.title}
                nextMatchDate={campaign.infos.nextMatchDate}
                image={campaign.cover?.link}
                fogColor="#0A358A"
                textColor="white"
                size="straight"
                buttonColor="white"
                buttonTitle={isPending ? 'Aguardando aprovação \u29d6' : 'Entrar no Jogo'}
                buttonDisabled={isPending}
                system={campaign.system}
                ageRestriction={campaign.ageRestriction}
                campaignPlayers={campaign.campaignPlayers}
                playerAmountLimit={campaign.infos.playerAmountLimit}
                campaignId={campaign.campaignId}
                onButtonClick={() =>
                    handleJoinClick(campaign.campaignId, campaign.campaignPlayers)
                }
            />
        );
    });

    const cards =
        cardMap.length > 0
            ? cardMap
            : [<BasicParticipationCard key="no-campaigns" onClick={onJoinClick} />];

    return (
        <section className="user-player-campaigns">
            <div className="user-player-campaigns-header">
                <div className="user-player-campaigns-created-label">
                    <span className="label-title font-L-semibold">Participando</span>
                    <div className="creation-limits font-XS-regular">
                        <span>Limite de participação</span>
                        <span>{campaigns.length}/8</span>
                    </div>
                </div>
                <div className="user-player-campaigns-buttons">
                    <button
                        className="button-L-fill font-XS-bold"
                        disabled={campaigns.length >= 8}
                        onClick={onJoinClick}
                    >
                        Entrar em uma nova campanha
                    </button>
                </div>
            </div>

            <div className="user-player-campaigns-cards embla">
                <Carousel elements={cards} />
            </div>

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
