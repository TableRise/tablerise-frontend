'use client';
import formatDate from '@/utils/formatDate';
import { type JournalPost } from '@/server/campaigns/get-journal-posts';
import '@/components/lobby/styles/JournalPostModal.css';

const CATEGORY_LABEL: Record<string, string> = {
    master: 'Mestre',
    admin: 'Admin',
    players: 'Jogadores',
    'characters-players': 'Personagens (Jogadores)',
    'characters-master': 'Personagens (Mestre)',
    environment: 'Ambiente',
    'world-news': 'Notícias do Mundo',
    announcements: 'Anúncios',
};

interface JournalPostModalProps {
    post: JournalPost;
    onClose: () => void;
}

function renderInline(text: string, keyOffset: number): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let k = keyOffset;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
        const token = match[0];
        if (token.startsWith('**'))
            parts.push(<strong key={k++}>{token.slice(2, -2)}</strong>);
        else if (token.startsWith('~~'))
            parts.push(<del key={k++}>{token.slice(2, -2)}</del>);
        else if (token.startsWith('*'))
            parts.push(<em key={k++}>{token.slice(1, -1)}</em>);
        lastIndex = match.index + token.length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
}

function renderLine(line: string, index: number): React.ReactNode {
    const h1 = line.match(/^#\s(.+)/);
    const h2 = line.match(/^##\s(.+)/);
    const h3 = line.match(/^###\s(.+)/);
    if (h3)
        return (
            <h3 key={index} className="font-S-bold jpm-paragraph">
                {renderInline(h3[1], index * 100)}
            </h3>
        );
    if (h2)
        return (
            <h2 key={index} className="font-M-bold jpm-paragraph">
                {renderInline(h2[1], index * 100)}
            </h2>
        );
    if (h1)
        return (
            <h1 key={index} className="font-L-bold jpm-paragraph">
                {renderInline(h1[1], index * 100)}
            </h1>
        );
    return (
        <p key={index} className="font-XS-regular jpm-paragraph">
            {renderInline(line, index * 100)}
        </p>
    );
}

export default function JournalPostModal({
    post,
    onClose,
}: JournalPostModalProps): JSX.Element {
    const lines = post.content.split('\n').filter((l) => l.trim().length > 0);

    return (
        <div className="jpm-overlay" onClick={onClose}>
            <div className="jpm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="jpm-header">
                    <div className="jpm-header-left">
                        <h2 className="font-L-bold jpm-title">{post.title}</h2>
                        <div className="jpm-meta">
                            <span className="font-XXS-regular">
                                {formatDate(post.timestamp)}
                            </span>
                            <span className="jpm-category-badge font-XXS-bold">
                                {CATEGORY_LABEL[post.category] ?? post.category}
                            </span>
                        </div>
                    </div>
                    <button
                        className="jpm-close-btn"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="jpm-divider" />
                <div className="jpm-body">
                    {lines.map((line, i) => renderLine(line, i))}
                </div>
            </div>
        </div>
    );
}
