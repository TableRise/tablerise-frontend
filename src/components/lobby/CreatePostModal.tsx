'use client';
import { useEffect, useRef, useState } from 'react';
import LoadingDots from '@/components/common/LoadingDots';
import {
    createJournalPost,
    updateCampaignJournalPost,
    type JournalPost,
} from '@/server/campaigns/get-journal-posts';
import '@/components/lobby/styles/CreatePostModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

const ALL_CATEGORY_OPTIONS = [
    { value: 'master', label: 'Mestre' },
    { value: 'admin', label: 'Admin' },
    { value: 'players', label: 'Jogadores' },
    { value: 'characters-players', label: 'Personagens (Jogadores)' },
    { value: 'characters-master', label: 'Personagens (Mestre)' },
    { value: 'environment', label: 'Ambiente' },
    { value: 'world-news', label: 'Notícias do Mundo' },
    { value: 'announcements', label: 'Anúncios' },
];

const ROLE_CATEGORIES: Record<string, string[]> = {
    player: ['players', 'characters-players'],
    dungeon_master: [
        'master',
        'characters-master',
        'environment',
        'world-news',
        'announcements',
    ],
    master: ['master', 'characters-master', 'environment', 'world-news', 'announcements'],
    admin_player: [
        'admin',
        'players',
        'characters-players',
        'environment',
        'world-news',
        'announcements',
    ],
};

function getCategoryOptions(userRole?: string) {
    const allowed = userRole ? ROLE_CATEGORIES[userRole] : undefined;
    if (!allowed) return ALL_CATEGORY_OPTIONS;
    return ALL_CATEGORY_OPTIONS.filter((opt) => allowed.includes(opt.value));
}

function normalizeEditorContent(content: string): string {
    return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

interface CreatePostModalProps {
    campaignId: string;
    userId?: string;
    userRole?: string;
    mode?: 'create' | 'edit';
    initialPost?: JournalPost | null;
    onClose: () => void;
    onCreated: (post?: { title: string; content: string; category: string }) => void;
}

export default function CreatePostModal({
    campaignId,
    userId,
    userRole,
    mode = 'create',
    initialPost = null,
    onClose,
    onCreated,
}: CreatePostModalProps): JSX.Element {
    useBodyScrollLock();
    const categoryOptions = getCategoryOptions(userRole);
    const [title, setTitle] = useState(initialPost?.title ?? '');
    const [content, setContent] = useState(initialPost?.content ?? '');
    const [category, setCategory] = useState(
        () => initialPost?.category ?? getCategoryOptions(userRole)[0]?.value ?? ''
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isEditMode = mode === 'edit';

    useEffect(() => {
        setTitle(initialPost?.title ?? '');
        setContent(initialPost?.content ?? '');
        setCategory(
            initialPost?.category ?? getCategoryOptions(userRole)[0]?.value ?? ''
        );
        setError('');
    }, [initialPost, userRole]);

    const wrapSelection = (before: string, after: string) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = content.slice(start, end);
        const next =
            content.slice(0, start) + before + selected + after + content.slice(end);
        setContent(next);
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(start + before.length, end + before.length);
        });
    };

    const applyHeading = (prefix: string) => {
        const el = textareaRef.current;
        if (!el) return;
        const cursor = el.selectionStart;
        const lineStart = content.lastIndexOf('\n', cursor - 1) + 1;
        const lineEnd = content.indexOf('\n', cursor);
        const end = lineEnd === -1 ? content.length : lineEnd;
        const line = content.slice(lineStart, end);
        const cleanLine = line.replace(/^#{1,3}\s/, '');
        const newLine = prefix ? `${prefix} ${cleanLine}` : cleanLine;
        setContent(content.slice(0, lineStart) + newLine + content.slice(end));
        requestAnimationFrame(() => el.focus());
    };

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();
        const trimmedContent = normalizeEditorContent(content).trim();

        if (!trimmedTitle || !trimmedContent) {
            setError('Título e conteúdo são obrigatórios.');
            return;
        }

        setError('');
        setSubmitting(true);
        try {
            if (isEditMode) {
                if (!userId) {
                    throw new Error('Usuário inválido para editar o post.');
                }

                await updateCampaignJournalPost(campaignId, userId, {
                    postId: initialPost?.postId ?? '',
                    title: trimmedTitle,
                    content: trimmedContent,
                    category,
                });
            } else {
                await createJournalPost(campaignId, {
                    title: trimmedTitle,
                    content: trimmedContent,
                    category,
                });
            }
            onCreated({
                title: trimmedTitle,
                content: trimmedContent,
                category,
            });
            onClose();
        } catch (err: any) {
            setError(
                err?.message ??
                    (isEditMode ? 'Erro ao atualizar post.' : 'Erro ao criar post.')
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="cpm-overlay">
            <div className="cpm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="cpm-header">
                    <h2 className="font-L-bold cpm-title">
                        {isEditMode ? 'Editar Post' : 'Criar Post'}
                    </h2>
                    <button
                        className="cpm-close-btn"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        X
                    </button>
                </div>

                <div className="cpm-body">
                    <div className="cpm-field">
                        <label className="font-XS-bold cpm-label">Título</label>
                        <input
                            className="cpm-input font-XS-regular"
                            placeholder="Título do post"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={120}
                        />
                    </div>

                    <div className="cpm-field">
                        <label className="font-XS-bold cpm-label">Categoria</label>
                        <select
                            className="cpm-select font-XS-regular"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {categoryOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="cpm-field">
                        <label className="font-XS-bold cpm-label">Conteúdo</label>
                        <div className="cpm-toolbar">
                            <button
                                type="button"
                                className="cpm-toolbar-btn font-S-bold"
                                title="Negrito"
                                onClick={() => wrapSelection('**', '**')}
                            >
                                B
                            </button>
                            <button
                                type="button"
                                className="cpm-toolbar-btn cpm-toolbar-btn--italic font-S-bold"
                                title="Itálico"
                                onClick={() => wrapSelection('*', '*')}
                            >
                                I
                            </button>
                            <button
                                type="button"
                                className="cpm-toolbar-btn cpm-toolbar-btn--strike font-S-bold"
                                title="Tachado"
                                onClick={() => wrapSelection('~~', '~~')}
                            >
                                S
                            </button>
                            <div className="cpm-toolbar-divider" />
                            <select
                                className="cpm-toolbar-select font-XXS-regular"
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
                            className="cpm-textarea font-XS-regular"
                            placeholder="Escreva o conteúdo do post..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {error && <span className="cpm-error font-XS-regular">{error}</span>}
                </div>

                <div className="cpm-footer">
                    <button
                        className="cpm-submit-btn font-XS-bold"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            isEditMode ? (
                                <LoadingDots label="Salvando publicação" />
                            ) : (
                                <LoadingDots label="Publicando" />
                            )
                        ) : isEditMode ? (
                            'Salvar alterações'
                        ) : (
                            'Publicar'
                        )}
                    </button>
                    <button className="cpm-cancel-btn font-XS-regular" onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
