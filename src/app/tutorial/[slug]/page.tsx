import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cards } from '@/app/tutorial/data';
import '@/app/tutorial/[slug]/styles/page.css';

interface TutorialDetailPageProps {
    params: { slug: string };
}

export function generateStaticParams() {
    return cards.map((card) => ({ slug: card.slug }));
}

export default function TutorialDetail({ params }: TutorialDetailPageProps): JSX.Element {
    const card = cards.find((c) => c.slug === params.slug);

    if (!card) notFound();

    return (
        <section className="tutorial-detail-page">
            <div className="tutorial-detail-container">
                <aside className="tutorial-detail-sidebar">
                    <h3 className="font-S-bold tutorial-detail-sidebar-title">
                        Outros tutoriais
                    </h3>
                    <nav>
                        <ul className="tutorial-detail-sidebar-list">
                            {cards.map((c) => (
                                <li key={c.slug}>
                                    <Link
                                        href={`/tutorial/${c.slug}`}
                                        className={`tutorial-detail-sidebar-item font-S-regular ${
                                            c.slug === params.slug
                                                ? 'tutorial-detail-sidebar-item--active font-S-bold'
                                                : ''
                                        }`}
                                    >
                                        {c.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                <main className="tutorial-detail-content">
                    <div
                        className={`tutorial-detail-hero${
                            !card.image ? ' tutorial-detail-hero--placeholder' : ''
                        }`}
                        style={
                            card.image
                                ? { backgroundImage: `url(${card.image})` }
                                : undefined
                        }
                    >
                        <div className="tutorial-detail-hero-fog" />
                        <span className="tutorial-detail-hero-title font-XL-bold text-color-greyScale/50">
                            {card.title}
                        </span>
                    </div>

                    <article className="tutorial-detail-body">
                        <p className="font-M-regular text-color-greyScale/900">
                            {card.description}
                        </p>

                        {card.topics.map((topic, index) => (
                            <section key={index} className="tutorial-detail-topic">
                                <h2 className="font-L-semibold text-color-primary/default_900">
                                    {topic.title}
                                </h2>
                                <p className="font-M-regular text-color-greyScale/900">
                                    {topic.body}
                                </p>
                            </section>
                        ))}
                    </article>
                </main>
            </div>
        </section>
    );
}
