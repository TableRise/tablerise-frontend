'use client';

import formatDate from '@/utils/formatDate';
import { areJournalPostsEqual } from '@/utils/journalPosts';
import { type JournalPost } from '@/server/campaigns/get-journal-posts';
import { CATEGORY_LABEL } from '@/app/campaigns/lobby/lobbyPageHelpers';

type LobbyJournalSectionProps = {
    rollingTitles: string[];
    postFilters: string[];
    activeFilter: string;
    filteredPosts: JournalPost[];
    highlightedJournalPost: JournalPost | null;
    onFilterChange: (filter: string) => void;
    onSelectPost: (post: JournalPost) => void;
};

export default function LobbyJournalSection({
    rollingTitles,
    postFilters,
    activeFilter,
    filteredPosts,
    highlightedJournalPost,
    onFilterChange,
    onSelectPost,
}: LobbyJournalSectionProps): JSX.Element {
    return (
        <div className="lobby-articles">
            <h2 className="font-L-semibold">Jornal da Campanha</h2>
            <div className="lobby-articles-box">
                <div className="lobby-ticker">
                    <span className="lobby-ticker-label font-XXS-bold">
                        O que os Goblins andam lendo:
                    </span>
                    <div className="lobby-ticker-track">
                        <div className="lobby-ticker-content">
                            {rollingTitles.map((title, index) => (
                                <span
                                    key={index}
                                    className="lobby-ticker-item font-XXS-regular"
                                >
                                    {title}
                                </span>
                            ))}
                            {rollingTitles.map((title, index) => (
                                <span
                                    key={`dup-${index}`}
                                    className="lobby-ticker-item font-XXS-regular"
                                >
                                    {title}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lobby-articles-filters">
                    {postFilters.map((filter) => (
                        <button
                            key={filter}
                            className={`lobby-filter-btn font-XXS-bold ${
                                activeFilter === filter ? 'lobby-filter-btn-active' : ''
                            }`}
                            onClick={() => onFilterChange(filter)}
                        >
                            {CATEGORY_LABEL[filter]}
                        </button>
                    ))}
                </div>
                <div className="lobby-articles-list">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post, index) => (
                            <article
                                key={index}
                                className="lobby-article"
                                onClick={() => onSelectPost(post)}
                            >
                                <div className="lobby-article-info">
                                    {areJournalPostsEqual(
                                        highlightedJournalPost,
                                        post
                                    ) ? (
                                        <span className="font-XXS-bold">Em destaque</span>
                                    ) : null}
                                    <h3 className="font-S-bold">{post.title}</h3>
                                    <p className="lobby-article-resume font-XS-regular">
                                        {post.content.split('\n')[0]}
                                    </p>
                                    <span className="lobby-article-date font-XXS-regular">
                                        {formatDate(post.timestamp)}
                                    </span>
                                </div>
                            </article>
                        ))
                    ) : (
                        <span className="font-XS-regular lobby-articles-empty">
                            Nenhuma publicação nesta categoria.
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
