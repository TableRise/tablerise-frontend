import type { ComponentProps } from 'react';
import Image from 'next/image';
import ArrowBackBlue from '@assets/icons/nav/arrow-back-blue.svg?url';
import ArrowBackDark from '@assets/icons/nav/arrow-back-dark.svg?url';
import ArrowRightBlue from '@assets/icons/nav/arrow-right-blue.svg?url';
import ArrowRightDark from '@assets/icons/nav/arrow-right-dark.svg?url';

type ArrowImageProps = Omit<ComponentProps<typeof Image>, 'src' | 'alt'> & {
    alt?: string;
    rotate?: number;
    mode: 'light' | 'dark';
};

export type ArrowLeftProps = ArrowImageProps;
export type ArrowRightProps = ArrowImageProps;

function buildArrowStyle(
    rotate: number | undefined,
    style: ComponentProps<typeof Image>['style']
) {
    if (rotate === undefined) {
        return style;
    }

    return {
        ...style,
        transform: `${style?.transform ? `${style.transform} ` : ''}rotate(${rotate}deg)`,
        transformOrigin: style?.transformOrigin ?? 'center',
    };
}

export function ArrowLeft({ rotate, style, mode, alt = '', ...props }: ArrowLeftProps) {
    const src = mode === 'dark' ? ArrowBackDark : ArrowBackBlue;

    return (
        <Image {...props} src={src} alt={alt} style={buildArrowStyle(rotate, style)} />
    );
}

export function ArrowRight({ rotate, style, mode, alt = '', ...props }: ArrowRightProps) {
    const src = mode === 'dark' ? ArrowRightDark : ArrowRightBlue;

    return (
        <Image {...props} src={src} alt={alt} style={buildArrowStyle(rotate, style)} />
    );
}
