import { MainCardProps } from '@/types/modules/components/common/MainCard';
import SideImageBackground from '../../../public/images/SideImageBackground.svg?url';
import '@/components/common/styles/MainCard.css';
import Link from 'next/link';
import { resolveCardStyles } from '@/utils/cardStyles';

export default function MainCard(cardProps: MainCardProps): JSX.Element {
    const {
        title = 'default',
        buttonTitle = 'Ler mais',
        fogColor = '#FFFFFF',
        size = 'medium',
        textColor = 'blue',
        buttonColor = 'blue',
    } = cardProps || {};

    let { image } = cardProps;

    const { cardSize, textColorCSS, buttonColorCSS, buttonTextColorCSS } =
        resolveCardStyles({ size, textColor, buttonColor });

    if (!image) image = SideImageBackground.src;

    return (
        <div
            className="main-card"
            style={{
                backgroundImage: `url(${image})`,
                ['--main-card-width' as string]: cardSize.w,
                ['--main-card-height' as string]: cardSize.h,
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
