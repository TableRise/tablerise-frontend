import Image from 'next/image';
import { projectDescription, timeline, team } from '@/app/about/data';
import LinkedinSVG from '@assets/icons/social-midia/linkedin.svg?url';
import LinkedinLightSVG from '@assets/icons/social-midia/linkedin-light.svg?url';
import GithubSVG from '@assets/icons/social-midia/github.svg?url';
import GithubLightSVG from '@assets/icons/social-midia/github-light.svg?url';
import GoogleSVG from '@assets/icons/social-midia/google.svg?url';
import GoogleLightSVG from '@assets/icons/social-midia/google-light.svg?url';
import DiscordSVG from '@assets/icons/social-midia/discord.svg?url';
import DiscordLightSVG from '@assets/icons/social-midia/discord-light.svg?url';
import FacebookSVG from '@assets/icons/social-midia/facebook.svg?url';
import FacebookLightSVG from '@assets/icons/social-midia/facebook-light.svg?url';
import InstagramSVG from '@assets/icons/social-midia/instagram.svg?url';
import InstagramLightSVG from '@assets/icons/social-midia/instagram-light.svg?url';
import TwitchSVG from '@assets/icons/social-midia/twitch.svg?url';
import TwitchLightSVG from '@assets/icons/social-midia/twitch-light.svg?url';
import XSVG from '@assets/icons/social-midia/x.svg?url';
import XLightSVG from '@assets/icons/social-midia/x-light.svg?url';
import WebSVG from '@assets/icons/social-midia/web.svg?url';
import WebLightSVG from '@assets/icons/social-midia/web-light.svg?url';
import '@/app/about/styles/page.css';

const SOCIAL_LINKS = [
    {
        id: 'linkedin',
        label: 'LinkedIn',
        iconDark: LinkedinSVG,
        iconLight: LinkedinLightSVG,
    },
    {
        id: 'github',
        label: 'GitHub',
        iconDark: GithubSVG,
        iconLight: GithubLightSVG,
    },
    {
        id: 'google',
        label: 'Google',
        iconDark: GoogleSVG,
        iconLight: GoogleLightSVG,
    },
    {
        id: 'discord',
        label: 'Discord',
        iconDark: DiscordSVG,
        iconLight: DiscordLightSVG,
    },
    {
        id: 'facebook',
        label: 'Facebook',
        iconDark: FacebookSVG,
        iconLight: FacebookLightSVG,
    },
    {
        id: 'instagram',
        label: 'Instagram',
        iconDark: InstagramSVG,
        iconLight: InstagramLightSVG,
    },
    {
        id: 'twitch',
        label: 'Twitch',
        iconDark: TwitchSVG,
        iconLight: TwitchLightSVG,
    },
    {
        id: 'x',
        label: 'X',
        iconDark: XSVG,
        iconLight: XLightSVG,
    },
];

type ResolvedSocialLink = {
    href: string;
    label: string;
    iconDark: string;
    iconLight: string;
};

function resolveSocialLink(rawLink: string): ResolvedSocialLink | null {
    const href = rawLink.trim();

    if (href === '') return null;

    const normalizedLink = href.toLowerCase();

    if (normalizedLink.startsWith('mailto:')) {
        return {
            href,
            label: 'Google',
            iconDark: GoogleSVG,
            iconLight: GoogleLightSVG,
        };
    }

    if (!normalizedLink.startsWith('http://') && !normalizedLink.startsWith('https://')) {
        return null;
    }

    const matchedSocial = SOCIAL_LINKS.find(({ id }) => normalizedLink.includes(id));

    if (!matchedSocial) {
        return {
            href,
            label: 'Website',
            iconDark: WebSVG,
            iconLight: WebLightSVG,
        };
    }

    return {
        href,
        label: matchedSocial.label,
        iconDark: matchedSocial.iconDark,
        iconLight: matchedSocial.iconLight,
    };
}

export default function About(): JSX.Element {
    return (
        <main className="about-page">
            <section className="about-hey-section">
                <div className="about-container">
                    <h2 className="font-XL-bold about-hey-title">Sobre nós</h2>
                    <p className="font-M-regular about-hey-text">{projectDescription}</p>
                </div>
            </section>

            <section className="about-timeline-section">
                <div className="about-container">
                    <h2 className="font-XL-bold about-timeline-heading">
                        Timeline do projeto
                    </h2>

                    <div className="about-timeline-track-wrapper">
                        {Array.from(
                            { length: Math.ceil(timeline.length / 4) },
                            (_, rowIdx) => timeline.slice(rowIdx * 4, rowIdx * 4 + 4)
                        ).map((row, rowIdx) => (
                            <div key={rowIdx} className="about-timeline-row-wrapper">
                                <div className="about-timeline-line" />

                                <div className="about-timeline-columns">
                                    {row.map((entry) => (
                                        <div
                                            key={entry.date}
                                            className="about-timeline-column"
                                        >
                                            <div className="about-timeline-date-row">
                                                <span className="font-XS-bold about-timeline-date">
                                                    {entry.date}
                                                </span>
                                                <div className="about-timeline-dot" />
                                            </div>

                                            <div className="about-timeline-cards">
                                                {entry.cards.map((card) => (
                                                    <div
                                                        key={`${entry.date}-${card.badge}`}
                                                        className="about-timeline-card"
                                                    >
                                                        <span
                                                            className="font-XS-bold about-timeline-badge"
                                                            style={{
                                                                backgroundColor:
                                                                    card.badgeColor,
                                                            }}
                                                        >
                                                            {card.badge}
                                                        </span>
                                                        <p className="font-XS-regular about-timeline-card-text">
                                                            {card.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="about-team-section">
                <div className="about-container">
                    <h2 className="font-XL-bold about-team-heading">
                        Quem construiu o Tablerise?
                    </h2>
                    <p className="font-S-regular about-team-intro">
                        Tivemos muitos colaboradores na nossa jornada, pode conferir
                        melhor no nosso{' '}
                        <a
                            href="https://github.com/TableRise"
                            target="_blank"
                            rel="noreferrer"
                            className="about-team-intro-link"
                        >
                            github
                        </a>
                        , abaixo você encontra os que mais ajudaram a construir nosso
                        Tablerise.
                    </p>

                    <div className="about-team-grid">
                        {team.map((member, index) => (
                            <div
                                key={`${member.name}-${member.avatar}-${index}`}
                                className="about-team-card"
                            >
                                <div className="about-team-card-header">
                                    <div className="about-team-avatar">
                                        {member.avatar ? (
                                            <Image
                                                src={member.avatar}
                                                alt={member.name}
                                                fill
                                                sizes="56px"
                                                className="about-team-avatar-image"
                                            />
                                        ) : null}
                                    </div>
                                    <div className="about-team-card-info">
                                        <span className="font-M-semibold about-team-name">
                                            {member.name}
                                        </span>
                                        <div className="about-team-roles">
                                            {member.roles.map((role) => (
                                                <span
                                                    key={`${member.name}-${role}`}
                                                    className="font-XS-regular about-team-role-badge"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <p className="font-XS-regular about-team-description">
                                    {member.description}
                                </p>

                                <div className="about-team-links">
                                    {member.links
                                        .map((link) => ({
                                            rawLink: link,
                                            socialLink: resolveSocialLink(link),
                                        }))
                                        .filter(
                                            (
                                                entry
                                            ): entry is {
                                                rawLink: string;
                                                socialLink: ResolvedSocialLink;
                                            } => entry.socialLink !== null
                                        )
                                        .map(({ rawLink, socialLink }) => (
                                            <a
                                                key={`${member.name}-${rawLink}`}
                                                href={socialLink.href}
                                                target="_blank"
                                                rel="noreferrer"
                                                title={socialLink.label}
                                                aria-label={socialLink.label}
                                                className="font-XS-bold about-team-link-btn"
                                            >
                                                <Image
                                                    src={socialLink.iconDark}
                                                    alt=""
                                                    width={16}
                                                    height={16}
                                                    aria-hidden="true"
                                                    className="about-team-link-icon about-team-link-icon--dark"
                                                />
                                                <Image
                                                    src={socialLink.iconLight}
                                                    alt=""
                                                    width={16}
                                                    height={16}
                                                    aria-hidden="true"
                                                    className="about-team-link-icon about-team-link-icon--light"
                                                />
                                                {socialLink.label}
                                            </a>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
