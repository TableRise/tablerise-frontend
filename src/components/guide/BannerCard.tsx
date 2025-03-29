import '@/components/guide/styles/BannerCard.css';
import ImageDnD5E03 from '@assets/images/image_dnd_5e_03.jpg';
import alts from '@assets/alts';
import Image from 'next/image';
import Link from 'next/link';

type Size = 'small' | 'medium';
type GradientColor = 'white' | 'blue';

const sizeMap: Record<Size, number> = {
    small: 360,
    medium: 744,
};

const gradientColorMap: Record<GradientColor, string> = {
    white: 'white',
    blue: '[#0A358A]',
};

const textColorMap: Record<GradientColor, string> = {
    white: 'text-color-primary/default_900',
    blue: 'text-color-greyScale/50',
};

const buttonTextColorMap: Record<GradientColor, string> = {
    white: 'text-color-greyScale/50',
    blue: 'text-color-primary/default_900',
};
const buttonColorMap: Record<GradientColor, string> = {
    white: 'bg-color-primary/default_900',
    blue: 'bg-color-greyScale/50',
};

type Props = {
    size?: Size;
    gradientColor?: GradientColor;
    text: string;
    link: string;
};

export default function BannerCard({
    size = 'small',
    gradientColor = 'white',
    text,
    link = '#',
}: Props): JSX.Element {
    return (
        <div className={`banner-card-image w-[${sizeMap[size]}px]`}>
            <Image
                src={ImageDnD5E03}
                alt={alts.tablerise_promo_image_txt}
                layout="fill"
                objectFit="cover"
                className="absolute inset-0"
            />
            <div
                className={`absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-${gradientColorMap[gradientColor]} to-transparent`}
            />
            <div className="absolute bottom-4 left-4 text-right z-10">
                <p
                    className={`font-L-semibold ${textColorMap[gradientColor]} mb-4 text-left`}
                >
                    {text}
                </p>
                <Link href={link}>
                    <button
                        className={`button-M-fill ${buttonTextColorMap[gradientColor]} font-XS-bold ${buttonColorMap[gradientColor]}`}
                    >
                        Ler mais
                    </button>
                </Link>
            </div>
        </div>
    );
}
