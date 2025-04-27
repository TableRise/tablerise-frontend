import { v4 as uuid } from 'uuid';
import CampaignCard from '@/components/common/CampaignCard';
import BasicCreationCard from '@/components/common/BasicCreationCard';
import MoreVertBlueSVG from '../../../assets/icons/nav/more-vert-blue.svg?url';
import { CampaignsToRender } from '@/types/modules/components/home/UserMasterCampaigns';
import Link from 'next/link';
import Image from 'next/image';
import '@/components/home/styles/UserMasterCampaigns.css';

export default function UserMasterCampaigns({
    campaigns,
}: CampaignsToRender): JSX.Element {
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
                    <Link href="/home/campaigns">
                        <button
                            className="button-L-fill font-XS-bold"
                            disabled={campaigns.length >= 2}
                        >
                            Criar uma campanha
                        </button>
                    </Link>
                    <Image
                        src={MoreVertBlueSVG.src}
                        alt="more-vert"
                        width={MoreVertBlueSVG.width}
                        height={MoreVertBlueSVG.height}
                    />
                </div>
            </div>

            <div className="user-master-campaigns-cards">
                {campaigns.length > 0 && (
                    <CampaignCard
                        className={'embla__slide'}
                        key={uuid()}
                        title={campaigns[0].title}
                        nextMatchDate={campaigns[0].infos.nextMatchDate}
                        fogColor="#0A358A"
                        textColor="white"
                        size="large"
                        buttonColor="white"
                        buttonTitle="Entrar no Jogo"
                    />
                )}
                {campaigns.length > 1 ? (
                    <CampaignCard
                        className={'embla__slide'}
                        key={uuid()}
                        title={campaigns[0].title}
                        nextMatchDate={campaigns[0].infos.nextMatchDate}
                        fogColor="#0A358A"
                        textColor="white"
                        buttonColor="white"
                        buttonTitle="Entrar no Jogo"
                    />
                ) : (
                    <BasicCreationCard />
                )}
            </div>
        </section>
    );
}
