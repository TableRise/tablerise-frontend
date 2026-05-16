'use client';
import { useEffect, useRef, useState } from 'react';
import formatDate from '@/utils/formatDate';
import {
    createUserCampaignNote,
    getUserCampaignNotes,
    type CampaignNote,
} from '@/server/users/campaign-notes';
import '@/components/match/styles/MatchNotesModal.css';

type MatchNotesView = 'list' | 'create' | 'read';

interface MatchNotesModalProps {
    campaignId: string;
    userId: string;
    onClose: () => void;
}

function renderInline(text: string, keyOffset: number): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let currentKey = keyOffset;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        const token = match[0];
        if (token.startsWith('**')) {
            parts.push(<strong key={currentKey++}>{token.slice(2, -2)}</strong>);
        } else if (token.startsWith('~~')) {
            parts.push(<del key={currentKey++}>{token.slice(2, -2)}</del>);
        } else if (token.startsWith('*')) {
            parts.push(<em key={currentKey++}>{token.slice(1, -1)}</em>);
        }

        lastIndex = match.index + token.length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}

function renderLine(line: string, index: number): React.ReactNode {
    const h1 = line.match(/^#\s(.+)/);
    const h2 = line.match(/^##\s(.+)/);
    const h3 = line.match(/^###\s(.+)/);

    if (h3) {
        return (
            <h3 key={index} className="font-S-bold mnm-paragraph">
                {renderInline(h3[1], index * 100)}
            </h3>
        );
    }

    if (h2) {
        return (
            <h2 key={index} className="font-M-semibold mnm-paragraph">
                {renderInline(h2[1], index * 100)}
            </h2>
        );
    }

    if (h1) {
        return (
            <h1 key={index} className="font-L-bold mnm-paragraph">
                {renderInline(h1[1], index * 100)}
            </h1>
        );
    }

    return (
        <p key={index} className="font-XS-regular mnm-paragraph">
            {renderInline(line, index * 100)}
        </p>
    );
}

export default function MatchNotesModal({
    campaignId,
    userId,
    onClose,
}: MatchNotesModalProps): JSX.Element {
    const [view, setView] = useState<MatchNotesView>('list');
    const [notes, setNotes] = useState<CampaignNote[]>([]);
    const [selectedNote, setSelectedNote] = useState<CampaignNote | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        async function loadNotes() {
            setLoading(true);
            setError('');

            try {
                const recoveredNotes = await getUserCampaignNotes(userId, campaignId);
                setNotes(recoveredNotes);
            } catch (err: any) {
                setError(err?.message ?? 'Erro ao carregar anotações.');
            } finally {
                setLoading(false);
            }
        }

        loadNotes();
    }, [campaignId, userId]);

    const wrapSelection = (before: string, after: string) => {
        const element = textareaRef.current;
        if (!element) return;

        const start = element.selectionStart;
        const end = element.selectionEnd;
        const selected = content.slice(start, end);
        const next =
            content.slice(0, start) + before + selected + after + content.slice(end);

        setContent(next);
        requestAnimationFrame(() => {
            element.focus();
            element.setSelectionRange(start + before.length, end + before.length);
        });
    };

    const applyHeading = (prefix: string) => {
        const element = textareaRef.current;
        if (!element) return;

        const cursor = element.selectionStart;
        const lineStart = content.lastIndexOf('\n', cursor - 1) + 1;
        const lineEnd = content.indexOf('\n', cursor);
        const end = lineEnd === -1 ? content.length : lineEnd;
        const line = content.slice(lineStart, end);
        const cleanLine = line.replace(/^#{1,3}\s/, '');
        const nextLine = prefix ? `${prefix} ${cleanLine}` : cleanLine;

        setContent(content.slice(0, lineStart) + nextLine + content.slice(end));
        requestAnimationFrame(() => element.focus());
    };

    const handleCreateClick = () => {
        setTitle('');
        setContent('');
        setSelectedNote(null);
        setError('');
        setView('create');
    };

    const handleReadClick = (note: CampaignNote) => {
        setSelectedNote(note);
        setError('');
        setView('read');
    };

    const handleBackToList = () => {
        setSelectedNote(null);
        setError('');
        setView('list');
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            setError('Título e conteúdo são obrigatórios.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await createUserCampaignNote(userId, campaignId, {
                title: title.trim(),
                content: content.trim(),
            });

            const refreshedNotes = await getUserCampaignNotes(userId, campaignId);
            setNotes(refreshedNotes);
            setTitle('');
            setContent('');
            setView('list');
        } catch (err: any) {
            setError(err?.message ?? 'Erro ao salvar anotação.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderedLines = (selectedNote?.content ?? '')
        .split('\n')
        .filter((line) => line.trim().length > 0);
    const selectedTimestamp = selectedNote?.updatedAt ?? selectedNote?.createdAt;

    return (
        <div className="mnm-overlay">
            <div className="mnm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="mnm-header">
                    <div className="mnm-header-left">
                        <h2 className="font-L-bold mnm-title">
                            {view === 'create'
                                ? 'Nova anotação'
                                : view === 'read'
                                ? selectedNote?.title
                                : 'Anotações'}
                        </h2>
                        {view === 'read' && selectedTimestamp && (
                            <span className="font-XXS-regular mnm-meta">
                                {formatDate(selectedTimestamp)}
                            </span>
                        )}
                    </div>
                    <button
                        className="mnm-close-btn"
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

                <div className="mnm-divider" />

                <div className="mnm-body">
                    {view === 'list' && (
                        <>
                            <div className="mnm-actions">
                                <button
                                    className="mnm-primary-btn font-XS-bold"
                                    onClick={handleCreateClick}
                                >
                                    Criar anotação
                                </button>
                            </div>

                            {loading ? (
                                <span className="font-XS-regular mnm-empty">
                                    Carregando anotações...
                                </span>
                            ) : notes.length === 0 ? (
                                <span className="font-XS-regular mnm-empty">
                                    Nenhuma anotação criada para esta campanha.
                                </span>
                            ) : (
                                <div className="mnm-list">
                                    {notes.map((note, index) => (
                                        <button
                                            key={note.id ?? `${note.title}-${index}`}
                                            className="mnm-note-card"
                                            onClick={() => handleReadClick(note)}
                                        >
                                            <span className="font-S-bold mnm-note-title">
                                                {note.title}
                                            </span>
                                            <span className="font-XXS-regular mnm-note-preview">
                                                {note.content.split('\n')[0]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {view === 'create' && (
                        <>
                            <button
                                className="mnm-back-btn font-XXS-bold"
                                onClick={handleBackToList}
                            >
                                Voltar para a lista
                            </button>

                            <div className="mnm-field">
                                <label className="font-XS-bold mnm-label">Título</label>
                                <input
                                    className="mnm-input font-XS-regular"
                                    placeholder="Título da anotação"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={120}
                                />
                            </div>

                            <div className="mnm-field">
                                <label className="font-XS-bold mnm-label">Conteúdo</label>
                                <div className="mnm-toolbar">
                                    <button
                                        type="button"
                                        className="mnm-toolbar-btn font-S-bold"
                                        title="Negrito"
                                        onClick={() => wrapSelection('**', '**')}
                                    >
                                        B
                                    </button>
                                    <button
                                        type="button"
                                        className="mnm-toolbar-btn mnm-toolbar-btn--italic font-S-bold"
                                        title="Itálico"
                                        onClick={() => wrapSelection('*', '*')}
                                    >
                                        I
                                    </button>
                                    <button
                                        type="button"
                                        className="mnm-toolbar-btn mnm-toolbar-btn--strike font-S-bold"
                                        title="Tachado"
                                        onClick={() => wrapSelection('~~', '~~')}
                                    >
                                        S
                                    </button>
                                    <div className="mnm-toolbar-divider" />
                                    <select
                                        className="mnm-toolbar-select font-XXS-regular"
                                        defaultValue=""
                                        onChange={(e) => {
                                            applyHeading(e.target.value);
                                            e.target.value = '';
                                        }}
                                    >
                                        <option value="">Tamanho</option>
                                        <option value="">Normal</option>
                                        <option value="#">Grande</option>
                                        <option value="##">Médio</option>
                                        <option value="###">Pequeno</option>
                                    </select>
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    className="mnm-textarea font-XS-regular"
                                    placeholder="Escreva sua anotação..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {view === 'read' && selectedNote && (
                        <>
                            <button
                                className="mnm-back-btn font-XXS-bold"
                                onClick={handleBackToList}
                            >
                                Voltar para a lista
                            </button>
                            <div className="mnm-read-body">
                                {renderedLines.length > 0 ? (
                                    renderedLines.map((line, index) =>
                                        renderLine(line, index)
                                    )
                                ) : (
                                    <p className="font-XS-regular mnm-paragraph">
                                        Sem conteúdo.
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {error && <span className="mnm-error font-XS-regular">{error}</span>}
                </div>

                {view === 'create' && (
                    <div className="mnm-footer">
                        <button
                            className="mnm-primary-btn font-XS-bold"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Salvando...' : 'Salvar anotação'}
                        </button>
                        <button
                            className="mnm-cancel-btn font-XS-regular"
                            onClick={handleBackToList}
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
