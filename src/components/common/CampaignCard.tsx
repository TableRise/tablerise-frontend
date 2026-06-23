import { CampaignCardProps } from '@/types/modules/components/common/CampaignCard';
import SideImageBackground from '../../../public/images/SideImageBackground.svg?url';
import Image from 'next/image';
import UserSVG from '../../../assets/icons/social/user.svg?url';
import CalendarSVG from '../../../assets/icons/sys/calendar.svg?url';
import DndLogoSVG from '../../../assets/icons/systems-rpg/dnd-logo.svg?url';
import '@/components/common/styles/CampaignCard.css';
import formatDate from '@/utils/formatDate';
import { resolveCardStyles } from '@/utils/cardStyles';

const systemLogos: Record<string, any> = {
    dnd5e: DndLogoSVG,
};

const ageRestrictionColors: Record<string, string> = {
    L: '#12AD00',
    '10': '#1B8BFF',
    '14': '#E87722',
    '16': '#D32F2F',
    '+18': '#000',
};

export default function CampaignCard(cardProps: CampaignCardProps): JSX.Element {
    const {
        title = 'default',
        className = '',
        buttonTitle = 'Ler mais',
        image = SideImageBackground.src,
        fogColor = '#FFFFFF',
        size = 'medium',
        textColor = 'blue',
        buttonColor = 'blue',
        nextMatchDate = 'Em aberto',
        system,
        ageRestriction,
        campaignPlayers = [],
        playerAmountLimit,
        onButtonClick,
        buttonDisabled = false,
    } = cardProps || {};

    const { cardSize, textColorCSS, buttonColorCSS, buttonTextColorCSS } =
        resolveCardStyles({ size, textColor, buttonColor });

    if (size === 'straight') cardSize.w = '21.8rem';

    let nextMatchDateRender = nextMatchDate;
    if (nextMatchDate === 'no-date') nextMatchDateRender = 'Em aberto';
    if (nextMatchDate !== 'no-date') nextMatchDateRender = formatDate(nextMatchDate);

    const systemLogo = system ? systemLogos[system] : null;
    const ageBadgeColor = ageRestriction ? ageRestrictionColors[ageRestriction] : null;
    const playerCount = campaignPlayers.filter(
        (p) => p.role === 'player' || p.role === 'admin_player'
    ).length;
    const isPendingApprovalButton = buttonTitle.includes('Aguardando aprovação');

    return (
        <div
            className={`campaign-card ${className}`}
            style={{
                backgroundImage: `url(${image})`,
                ['--campaign-card-width' as string]: cardSize.w,
                ['--campaign-card-height' as string]: cardSize.h,
            }}
        >
            {systemLogo && (
                <div className="card-system-logo">
                    <Image
                        src={systemLogo.src}
                        alt={`${system} logo`}
                        width={systemLogo.width}
                        height={systemLogo.height}
                    />
                </div>
            )}
            {ageBadgeColor && (
                <div
                    className="card-age-badge font-XS-bold"
                    style={{ backgroundColor: ageBadgeColor }}
                >
                    {ageRestriction}
                </div>
            )}
            <div
                className="card-fog"
                style={{
                    background: `linear-gradient(to top, ${fogColor} 30%, rgba(255, 255, 255, 0) 100%)`,
                }}
            />
            <div className="card-infos">
                <span
                    className={`font-L-semibold ${textColorCSS} truncate min-w-0 w-full`}
                >
                    {title}
                </span>

                <div className="date-schedule">
                    <Image
                        src={CalendarSVG.src}
                        alt="calendar"
                        width={CalendarSVG.width}
                        height={CalendarSVG.height}
                    />
                    <span className="font-XS-bold">
                        {nextMatchDateRender === 'Em aberto'
                            ? nextMatchDateRender
                            : `Agendado: ${nextMatchDateRender}`}
                    </span>
                </div>

                <div className="card-buttons">
                    <button
                        className={`${buttonColorCSS} ${buttonTextColorCSS} ${
                            isPendingApprovalButton
                                ? 'font-XXS-bold campaign-card__pending-button'
                                : 'font-XS-bold'
                        }`}
                        onClick={onButtonClick}
                        disabled={buttonDisabled}
                    >
                        {buttonTitle}
                    </button>
                    <div className="card-player-limit font-XS-regular">
                        <Image
                            src={UserSVG.src}
                            alt="Player icon"
                            width={25}
                            height={25}
                        />
                        <span>
                            {playerCount}/{playerAmountLimit ?? 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
