import { SVGProps } from 'react';

export interface MainCardProps {
    image?: any;
    fogColor?: string;
    size?: string;
    slug?: string;
    title?: string;
    buttonTitle?: string;
    textColor?: string;
    buttonColor?: string;
    onClick?: () => void;
}
