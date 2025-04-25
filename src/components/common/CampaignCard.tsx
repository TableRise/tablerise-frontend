import { CampaignCardProps } from '@/types/modules/components/common/CampaignCard';
import SideImageBackground from '../../../public/images/SideImageBackground.svg?url';
import Link from 'next/link';
import Image from 'next/image';
import MoreVertSVG from '../../../assets/icons/nav/more-vert.svg?url';
import CalendarSVG from '../../../assets/icons/sys/calendar.svg?url';
import '@/components/common/styles/CampaignCard.css';

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
    } = cardProps || {};

    const cardSize = { w: '22.5rem', h: '22.5rem' };
    let textColorCSS = 'text-color-primary/default_900';
    let buttonColorCSS = 'button-L-fill';
    let buttonTextColorCSS = 'text-color-greyScale/50';

    if (size === 'straight') cardSize.w = '21.8rem';
    if (size === 'large') cardSize.w = '44rem';
    if (textColor === 'white') textColorCSS = 'text-color-greyScale/50';
    if (buttonColor === 'white') buttonColorCSS = 'button-white-default';
    if (buttonColor === 'white') buttonTextColorCSS = 'text-color-primary/default_900';

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
                    <span className="font-XS-bold">Em aberto</span>
                </div>

                <div className="card-buttons">
                    <Link href={`/tutorial/${title.toLowerCase()}`}>
                        <button className={`${buttonColorCSS} ${buttonTextColorCSS}`}>
                            {buttonTitle}
                        </button>
                    </Link>
                    <div className="card-menu">
                        <Image
                            src={MoreVertSVG.src}
                            alt="menu"
                            width={MoreVertSVG.width}
                            height={MoreVertSVG.height}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
