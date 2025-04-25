import { MainCardProps } from '@/types/modules/components/common/MainCard';
import SideImageBackground from '../../../public/images/SideImageBackground.svg?url';
import '@/components/common/styles/MainCard.css';
import Link from 'next/link';

export default function MainCard(cardProps: MainCardProps): JSX.Element {
    const {
        title = 'default',
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

    if (size === 'large') cardSize.w = '46.5rem';
    if (textColor === 'white') textColorCSS = 'text-color-greyScale/50';
    if (buttonColor === 'white') buttonColorCSS = 'button-white-default';
    if (buttonColor === 'white') buttonTextColorCSS = 'text-color-primary/default_900';

    return (
        <div
            className="main-card"
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
                <span className={`font-L-semibold ${textColorCSS} mb-4`}>{title}</span>
                <Link href={`/tutorial/${title.toLowerCase()}`}>
                    <button className={`${buttonColorCSS} ${buttonTextColorCSS}`}>
                        {buttonTitle}
                    </button>
                </Link>
            </div>
        </div>
    );
}
