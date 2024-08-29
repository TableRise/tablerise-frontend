import { v4 as uuid } from 'uuid';
import Image from 'next/image';
import { Elements } from '@/types/modules/components/home/FeatureCards';
import '@/components/styles/FeatureCards.css';

export default function FeatureCards({
    elements,
}: {
    elements: Elements[];
}): JSX.Element {
    return (
        <>
            {elements.map((el) => {
                const { image, text } = el;
                return (
                    <div key={uuid()} className="feature-card">
                        <Image src={image} alt="Imagem ilustrativa para card" />
                        <span className="font-M-semibold">{text}</span>
                    </div>
                );
            })}
        </>
    );
}
