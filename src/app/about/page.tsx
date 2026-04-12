import { v4 as uuid } from 'uuid';
import { projectDescription, timeline, team } from '@/app/about/data';
import '@/app/about/styles/page.css';

export default function About(): JSX.Element {
    return (
        <main className="about-page">
            {/* ── Hey! ────────────────────────────────────────────── */}
            <section className="about-hey-section">
                <div className="about-container">
                    <h2 className="font-XL-bold about-hey-title">Hey!</h2>
                    <p className="font-M-regular about-hey-text">{projectDescription}</p>
                </div>
            </section>

            {/* ── Timeline ────────────────────────────────────────── */}
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
                                {/* horizontal line for this row */}
                                <div className="about-timeline-line" />

                                {/* date columns */}
                                <div className="about-timeline-columns">
                                    {row.map((entry) => (
                                        <div
                                            key={uuid()}
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
                                                        key={uuid()}
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

            {/* ── Nossa equipe ────────────────────────────────────── */}
            <section className="about-team-section">
                <div className="about-container">
                    <h2 className="font-XL-bold about-team-heading">Nossa equipe</h2>

                    <div className="about-team-grid">
                        {team.map((member) => (
                            <div key={uuid()} className="about-team-card">
                                <div className="about-team-card-header">
                                    <div className="about-team-avatar" />
                                    <div className="about-team-card-info">
                                        <span className="font-M-semibold about-team-name">
                                            {member.name}
                                        </span>
                                        <div className="about-team-roles">
                                            {member.roles.map((role) => (
                                                <span
                                                    key={uuid()}
                                                    className="font-XS-regular about-team-role-badge"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <p className="font-S-regular about-team-description">
                                    {member.description}
                                </p>

                                <div className="about-team-links">
                                    {member.links.map((link) => (
                                        <button
                                            key={uuid()}
                                            className="font-XS-bold about-team-link-btn"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                width="16"
                                                height="16"
                                                aria-hidden="true"
                                            >
                                                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                            </svg>
                                            {link}
                                        </button>
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
