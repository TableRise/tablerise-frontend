import { v4 as uuid } from 'uuid';
import Image from 'next/image';
import CampaignCard from '@/components/common/CampaignCard';
import MoreVertBlueSVG from '../../../assets/icons/nav/more-vert-blue.svg?url';
import SearchBlueSVG from '../../../assets/icons/nav/search-blue.svg?url';
import { CampaignsToRender } from '@/types/modules/components/home/UserMasterCampaigns';
import Link from 'next/link';
import Carousel from '../common/Carousel';
import '@/components/home/styles/UserPlayerCampaigns.css';
import BasicParticipationCard from '../common/BasicParticipationCard';

export default function UserPlayerCampaigns({
    campaigns,
}: CampaignsToRender): JSX.Element {
    const cardMap = campaigns.map((campaign) => (
        <CampaignCard
            className={'embla__slide'}
            key={uuid()}
            title={campaign.title}
            nextMatchDate={campaign.infos.nextMatchDate}
            fogColor="#0A358A"
            textColor="white"
            size="straight"
            buttonColor="white"
            buttonTitle="Entrar no Jogo"
            system={campaign.system}
            ageRestriction={campaign.ageRestriction}
        />
    ));

    const cards =
        cardMap.length > 0 ? cardMap : [<BasicParticipationCard key="no-campaigns" />];

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
                    <Link href="/home/campaigns">
                        <button
                            className="button-L-fill font-XS-bold"
                            disabled={campaigns.length >= 8}
                        >
                            Entrar em uma nova campanha
                        </button>
                    </Link>

                    <Image
                        src={SearchBlueSVG.src}
                        alt="more-vert"
                        width={SearchBlueSVG.width}
                        height={SearchBlueSVG.height}
                    />

                    <Image
                        src={MoreVertBlueSVG.src}
                        alt="more-vert"
                        width={MoreVertBlueSVG.width}
                        height={MoreVertBlueSVG.height}
                    />
                </div>
            </div>

            <div className="user-player-campaigns-cards embla">
                <Carousel elements={cards} />
            </div>
        </section>
    );
}
