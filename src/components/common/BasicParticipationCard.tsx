import { MainCardProps } from '@/types/modules/components/common/MainCard';
import Image from 'next/image';
import Add from '../../../assets/icons/nav/add.svg?url';
import '@/components/common/styles/BasicCreationCard.css';

export default function BasicParticipationCard(cardProps: MainCardProps): JSX.Element {
    const { size = 'medium', onClick } = cardProps || {};

    const cardSize = { w: '21.8rem', h: '21.8rem' };

    if (size === 'large') cardSize.w = '46.5rem';

    return (
        <div
            className="basic-creation-card"
            style={{ width: cardSize.w, height: cardSize.h }}
        >
            <button type="button" className="basic-add-button" onClick={onClick}>
                <Image src={Add.src} alt="add" width={Add.width} height={Add.height} />
            </button>
        </div>
    );
}
