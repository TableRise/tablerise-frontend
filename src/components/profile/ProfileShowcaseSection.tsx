'use client';

import type { ReactNode } from 'react';
import ProfileCarousel from '@/components/profile/ProfileCarousel';

type ProfileShowcaseSectionProps = {
    title: string;
    subtitle: string;
    items: ReactNode[];
    label: string;
    variant: 'campaigns' | 'characters' | 'badges';
    emptyMessage?: string;
    cardLayout?: boolean;
};

export default function ProfileShowcaseSection({
    title,
    subtitle,
    items,
    label,
    variant,
    emptyMessage,
    cardLayout = false,
}: ProfileShowcaseSectionProps): JSX.Element {
    return (
        <section
            className={`profile-showcase${cardLayout ? ' profile-showcase--cards' : ''}`}
        >
            <div className="profile-showcase__header">
                <h2 className="font-L-bold text-color-greyScale/50">{title}</h2>
                <p className="font-XS-regular text-color-greyScale/200">{subtitle}</p>
            </div>

            {items.length > 0 ? (
                <ProfileCarousel items={items} label={label} variant={variant} />
            ) : emptyMessage ? (
                <div className="profile-empty-state">
                    <p className="font-S-regular text-color-greyScale/200">
                        {emptyMessage}
                    </p>
                </div>
            ) : (
                <ProfileCarousel items={items} label={label} variant={variant} />
            )}
        </section>
    );
}
