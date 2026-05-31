'use client';

import { ReactNode } from 'react';

type ProfileStateCardProps = {
    title: ReactNode;
    description: ReactNode;
};

export default function ProfileStateCard({
    title,
    description,
}: ProfileStateCardProps): JSX.Element {
    return (
        <section className="profile-state-card">
            <h1 className="font-XL-bold profile-state-title">{title}</h1>
            <p className="font-S-regular text-color-greyScale/700">{description}</p>
        </section>
    );
}
