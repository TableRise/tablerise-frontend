'use client';

import type { ReactNode } from 'react';
import ProfileCarousel from '@/components/profile/ProfileCarousel';

type ProfileShowcaseSectionProps = {
    title: string;
    subtitle: string;
    items: ReactNode[];
    label: string;
    variant: 'campaigns' | 'characters' | 'badges' | 'friends';
    emptyMessage?: string;
    cardLayout?: boolean;
    headerAction?: ReactNode;
};

export default function ProfileShowcaseSection({
    title,
    subtitle,
    items,
    label,
    variant,
    emptyMessage,
    cardLayout = false,
    headerAction,
}: ProfileShowcaseSectionProps): JSX.Element {
    return (
        <section
            className={`profile-showcase${cardLayout ? ' profile-showcase--cards' : ''}`}
        >
            <div className="profile-showcase__header">
                <div className="profile-showcase__heading">
                    <h2 className="font-M-semibold text-color-greyScale/50">{title}</h2>
                    <p className="font-XS-regular text-color-greyScale/300">{subtitle}</p>
                </div>
                {headerAction ? (
                    <div className="profile-showcase__action">{headerAction}</div>
                ) : null}
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
