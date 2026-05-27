'use client';

type ProfileStateCardProps = {
    title: string;
    description: string;
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
