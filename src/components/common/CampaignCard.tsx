import { CampaignCardProps } from '@/types/modules/components/common/CampaignCard';
import SideImageBackground from '../../../public/images/SideImageBackground.svg?url';
import Link from 'next/link';
import Image from 'next/image';
import MoreVertSVG from '../../../assets/icons/nav/more-vert.svg?url';
import CalendarSVG from '../../../assets/icons/sys/calendar.svg?url';
import '@/components/common/styles/CampaignCard.css';
import formatDate from '@/utils/formatDate';
import { resolveCardStyles } from '@/utils/cardStyles';

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
    } = cardProps || {};

    const { cardSize, textColorCSS, buttonColorCSS, buttonTextColorCSS } =
        resolveCardStyles({ size, textColor, buttonColor });

    if (size === 'straight') cardSize.w = '21.8rem';

    let nextMatchDateRender = nextMatchDate;
    if (nextMatchDate === 'no-date') nextMatchDateRender = 'Em aberto';
    if (nextMatchDate !== 'no-date') nextMatchDateRender = formatDate(nextMatchDate);

    return (
        <div
            className={`campaign-card ${className}`}
            style={{
                backgroundImage: `url(${image})`,
                width: cardSize.w,
                height: cardSize.h,
            }}
        >
            <div
                className="card-fog"
                style={{
                    background: `linear-gradient(to top, ${fogColor} 30%, rgba(255, 255, 255, 0) 100%)`,
                }}
            />
            <div className="card-infos">
                <span className={`font-L-semibold ${textColorCSS}`}>{title}</span>

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
                    <Link href={`/tutorial/${title.toLowerCase()}`}>
                        <button className={`${buttonColorCSS} ${buttonTextColorCSS}`}>
                            {buttonTitle}
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
