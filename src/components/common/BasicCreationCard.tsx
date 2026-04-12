import { MainCardProps } from '@/types/modules/components/common/MainCard';
import Image from 'next/image';
import Add from '../../../assets/icons/nav/add.svg?url';
import '@/components/common/styles/BasicCreationCard.css';

export default function BasicCreationCard(cardProps: MainCardProps): JSX.Element {
    const { size = 'medium' } = cardProps || {};

    const cardSize = { w: '22.5rem', h: '22.5rem' };

    if (size === 'large') cardSize.w = '46.5rem';

    return (
        <div
            className="basic-creation-card"
            style={{ width: cardSize.w, height: cardSize.h }}
        >
            <button type="button" className="basic-add-button" onClick={cardProps.onClick}>
                <Image src={Add.src} alt="add" width={Add.width} height={Add.height} />
            </button>
        </div>
    );
}
