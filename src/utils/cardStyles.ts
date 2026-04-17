interface CardStyleOptions {
    size?: string;
    textColor?: string;
    buttonColor?: string;
}

interface CardStyles {
    cardSize: { w: string; h: string };
    textColorCSS: string;
    buttonColorCSS: string;
    buttonTextColorCSS: string;
}

export function resolveCardStyles(options: CardStyleOptions): CardStyles {
    const { size = 'medium', textColor = 'blue', buttonColor = 'blue' } = options;

    const cardSize = { w: '22.5rem', h: '22.5rem' };
    let textColorCSS = 'text-color-primary/default_900';
    let buttonColorCSS = 'button-L-fill';
    let buttonTextColorCSS = 'text-color-greyScale/50';

    if (size === 'straight') cardSize.w = '21.8rem';
    if (size === 'medium-large') cardSize.w = '40rem';
    if (size === 'large') cardSize.w = '44.5rem';
    if (textColor === 'white') textColorCSS = 'text-color-greyScale/50';
    if (buttonColor === 'white') {
        buttonColorCSS = 'button-white-default';
        buttonTextColorCSS = 'text-color-primary/default_900';
    }

    return { cardSize, textColorCSS, buttonColorCSS, buttonTextColorCSS };
}
