import '@/components/guide/styles/GuideMenuBanner.css';
import ImageDnD5E03 from '@assets/images/image_dnd_5e_03.jpg';
import alts from '@assets/alts';
import Link from 'next/link';
import BannerCard from './BannerCard';

type Size = 'small' | 'medium';

const sizeMap: Record<Size, number> = {
    small: 360,
    medium: 744,
};

type Props = {
    size?: Size;
};

export default function GuideMenuBanner({ size = 'small' }: Props): JSX.Element {
    const width = sizeMap[size];
    return (
        <section className="guide-menu-banner-section">
            <div className="guide-menu-banner-text">
                <h2 className="font-XL-bold">Tutorial</h2>
                <p className="font-M-regular">
                    Adicione imagens, personagens, trilhas sonoras e muitas outras funções
                    disponíveis dentro de sua sessão!
                </p>
            </div>
            <div className="flex flex-col gap-6 mb-24">
                <div className="flex flex-row w-full gap-6">
                    <BannerCard
                        size="medium"
                        gradientColor="blue"
                        text="Campanha"
                        link="#"
                    />
                    <BannerCard
                        size="small"
                        gradientColor="white"
                        text="Ficha"
                        link="#"
                    />
                </div>
                <div className="flex flex-row w-full gap-6">
                    <BannerCard size="small" gradientColor="white" text="Mesa" link="#" />
                    <BannerCard
                        size="small"
                        gradientColor="white"
                        text="Jogadores"
                        link="#"
                    />
                    <BannerCard size="small" gradientColor="white" text="Tit" link="/" />
                </div>
            </div>
        </section>
    );
}
