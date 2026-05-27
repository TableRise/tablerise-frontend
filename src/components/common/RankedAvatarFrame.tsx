'use client';

import Image from 'next/image';
import shapes from '@assets/shapes.js';
import '@/components/common/styles/RankedAvatarFrame.css';

const VALID_RANKS = ['bronze', 'diamond', 'gold', 'white'] as const;

type RankKey = (typeof VALID_RANKS)[number];
type RankedAvatarVariant = 'profile' | 'avatar';

type RankedAvatarFrameProps = {
    image: string;
    alt: string;
    rank?: string | null;
    variant: RankedAvatarVariant;
    className?: string;
    sizes?: string;
};

function normalizeRank(rank?: string | null): RankKey | null {
    if (!rank) return null;

    const normalizedRank = rank.trim().toLowerCase();
    const matchedRank = normalizedRank.match(/bronze|diamond|gold|white/)?.[0];

    return VALID_RANKS.includes(normalizedRank as RankKey)
        ? (normalizedRank as RankKey)
        : VALID_RANKS.includes(matchedRank as RankKey)
        ? (matchedRank as RankKey)
        : null;
}

export default function RankedAvatarFrame({
    image,
    alt,
    rank,
    variant,
    className,
    sizes = '8rem',
}: RankedAvatarFrameProps): JSX.Element {
    const normalizedRank = normalizeRank(rank);
    const frameImage = normalizedRank ? shapes[normalizedRank][variant] : null;
    const modeClassName = frameImage
        ? 'ranked-avatar-frame--framed'
        : 'ranked-avatar-frame--plain';

    return (
        <div
            className={`ranked-avatar-frame ranked-avatar-frame--${variant} ${modeClassName}${
                className ? ` ${className}` : ''
            }`}
        >
            <div className="ranked-avatar-frame__mask">
                <div className="ranked-avatar-frame__portrait-layer">
                    <Image
                        src={image}
                        alt={alt}
                        fill
                        unoptimized
                        sizes={sizes}
                        className="ranked-avatar-frame__image"
                    />
                </div>
            </div>

            {frameImage ? (
                <div className="ranked-avatar-frame__frame-overlay" aria-hidden="true">
                    <Image
                        src={frameImage}
                        alt=""
                        fill
                        unoptimized
                        sizes={sizes}
                        className="ranked-avatar-frame__frame-image"
                    />
                </div>
            ) : null}
        </div>
    );
}
