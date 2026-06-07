'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import formatDate from '@/utils/formatDate';
import LoadingDots from '@/components/common/LoadingDots';
import RankedAvatarFrame from '@/components/common/RankedAvatarFrame';
import { getUser } from '@/server/users/get-user';
import {
    deleteUserMessage,
    getUserMessages,
    markUserMessageAsRead,
    sendUserMessage,
    type UserMessageRecord,
} from '@/server/users/collections';
import { defaultProfileImage } from '@/components/profile/profilePageHelpers';
import type { DatabaseUserWithDetails } from '@/types/shared/entities';
import TrashSvg from '@assets/icons/sys/trash.svg?url';
import '@/components/profile/styles/ProfileActionModal.css';

type ProfileMessagesModalProps = {
    mode: 'inbox' | 'compose';
    ownerUserId: string;
    currentUserId: string;
    recipientLabel: string;
    onMessagesChange?: (messages: UserMessageRecord[]) => void;
    onClose: () => void;
};

type MessageSenderMap = Record<string, DatabaseUserWithDetails | null>;

function normalizeContent(content: string): string[] {
    return content
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\r\n/g, '\n')
        .split('\n');
}

function renderInline(text: string, keyOffset: number): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = keyOffset;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        const token = match[0];

        if (token.startsWith('**')) {
            parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
        } else if (token.startsWith('~~')) {
            parts.push(<del key={key++}>{token.slice(2, -2)}</del>);
        } else {
            parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
        }

        lastIndex = match.index + token.length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}

function renderMessageLine(line: string, index: number): React.ReactNode {
    if (!line.trim()) {
        return <div key={index} className="profile-message-modal__line-break" />;
    }

    const h1 = line.match(/^#\s(.+)/);
    const h2 = line.match(/^##\s(.+)/);
    const h3 = line.match(/^###\s(.+)/);

    if (h3) {
        return (
            <h3 key={index} className="font-S-bold profile-message-modal__paragraph">
                {renderInline(h3[1], index * 100)}
            </h3>
        );
    }

    if (h2) {
        return (
            <h2 key={index} className="font-M-semibold profile-message-modal__paragraph">
                {renderInline(h2[1], index * 100)}
            </h2>
        );
    }

    if (h1) {
        return (
            <h1 key={index} className="font-L-bold profile-message-modal__paragraph">
                {renderInline(h1[1], index * 100)}
            </h1>
        );
    }

    return (
        <p key={index} className="font-XS-regular profile-message-modal__paragraph">
            {renderInline(line, index * 100)}
        </p>
    );
}

function normalizeEditorContent(content: string): string {
    return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function getSenderImage(sender: DatabaseUserWithDetails | null): string {
    if (typeof sender?.picture?.link === 'string' && sender.picture.link.trim()) {
        return sender.picture.link;
    }

    return defaultProfileImage;
}

function getSenderRank(sender: DatabaseUserWithDetails | null): string | undefined {
    const maybeRank = (sender as { rank?: string | null } | null)?.rank;

    return typeof maybeRank === 'string' ? maybeRank : undefined;
}

export default function ProfileMessagesModal({
    mode,
    ownerUserId,
    currentUserId,
    recipientLabel,
    onMessagesChange,
    onClose,
}: ProfileMessagesModalProps): JSX.Element {
    const [messages, setMessages] = useState<UserMessageRecord[]>([]);
    const [loading, setLoading] = useState(mode === 'inbox');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [senderMap, setSenderMap] = useState<MessageSenderMap>({});
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const markingMessageIdsRef = useRef(new Set<string>());

    useEffect(() => {
        if (mode !== 'inbox') return;

        let mounted = true;

        async function loadMessages() {
            setLoading(true);
            setError('');

            try {
                const inboxMessages = await getUserMessages(ownerUserId);

                if (!mounted) return;

                const orderedMessages = [...inboxMessages].sort((left, right) => {
                    return (
                        new Date(right.timestamp).getTime() -
                        new Date(left.timestamp).getTime()
                    );
                });

                setMessages(orderedMessages);
                onMessagesChange?.(orderedMessages);
                setSelectedMessageId(orderedMessages[0]?.messageId ?? null);

                const senderIds = Array.from(
                    new Set(
                        orderedMessages
                            .map((message) => message.userId?.trim())
                            .filter(Boolean)
                    )
                );

                const senders = await Promise.all(
                    senderIds.map(async (senderId) => {
                        try {
                            return [senderId, await getUser(senderId)] as const;
                        } catch {
                            return [senderId, null] as const;
                        }
                    })
                );

                if (!mounted) return;

                setSenderMap(Object.fromEntries(senders));
            } catch (loadError: Error | any) {
                if (!mounted) return;

                setError(loadError?.message ?? 'Nao foi possivel carregar as mensagens');
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        void loadMessages();

        return () => {
            mounted = false;
        };
    }, [mode, onMessagesChange, ownerUserId]);

    const selectedMessage = useMemo(
        () => messages.find((message) => message.messageId === selectedMessageId) ?? null,
        [messages, selectedMessageId]
    );

    const selectedSender = selectedMessage
        ? senderMap[selectedMessage.userId] ?? null
        : null;

    useEffect(() => {
        if (mode !== 'inbox' || !selectedMessage) return;
        if (selectedMessage.status !== 'not-read') return;
        if (markingMessageIdsRef.current.has(selectedMessage.messageId)) return;

        const { messageId } = selectedMessage;

        markingMessageIdsRef.current.add(messageId);

        void (async () => {
            try {
                await markUserMessageAsRead(ownerUserId, messageId);

                setMessages((previous) => {
                    const nextMessages = previous.map((message) =>
                        message.messageId === messageId
                            ? { ...message, status: 'read' }
                            : message
                    );

                    onMessagesChange?.(nextMessages);
                    return nextMessages;
                });
            } catch (markError: Error | any) {
                setError(
                    markError?.message ?? 'Nao foi possivel marcar a mensagem como lida'
                );
            } finally {
                markingMessageIdsRef.current.delete(messageId);
            }
        })();
    }, [mode, onMessagesChange, ownerUserId, selectedMessage]);

    const wrapSelection = (before: string, after: string) => {
        const element = textareaRef.current;

        if (!element) return;

        const start = element.selectionStart;
        const end = element.selectionEnd;
        const selected = content.slice(start, end);
        const nextContent =
            content.slice(0, start) + before + selected + after + content.slice(end);

        setContent(nextContent);

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

        requestAnimationFrame(() => {
            element.focus();
        });
    };

    const handleDeleteMessage = async () => {
        if (!selectedMessage) return;

        setDeletingMessageId(selectedMessage.messageId);
        setError('');

        try {
            await deleteUserMessage(ownerUserId, selectedMessage.messageId);

            const nextMessages = messages.filter(
                (message) => message.messageId !== selectedMessage.messageId
            );

            setMessages(nextMessages);
            onMessagesChange?.(nextMessages);
            setSelectedMessageId(nextMessages[0]?.messageId ?? null);
        } catch (deleteError: Error | any) {
            setError(deleteError?.message ?? 'Nao foi possivel remover a mensagem');
        } finally {
            setDeletingMessageId(null);
        }
    };

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();
        const trimmedContent = normalizeEditorContent(content).trim();

        if (!trimmedTitle || !trimmedContent) {
            setError('Titulo e conteudo sao obrigatorios.');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            await sendUserMessage(currentUserId, {
                title: trimmedTitle,
                content: trimmedContent,
                targetUserId: ownerUserId,
            });

            setSuccessMessage('Mensagem enviada com sucesso.');
            setTitle('');
            setContent('');
            window.setTimeout(() => {
                onClose();
            }, 700);
        } catch (submitError: Error | any) {
            setError(submitError?.message ?? 'Nao foi possivel enviar a mensagem');
        } finally {
            setSubmitting(false);
        }
    };

    if (mode === 'compose') {
        return (
            <div className="profile-action-modal-overlay">
                <div
                    className="profile-action-modal-card profile-action-modal-card--messages"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="profile-gallery-picker__header">
                        <div className="profile-gallery-picker__copy">
                            <h1 className="profile-action-modal-title font-L-semibold">
                                Enviar mensagem
                            </h1>
                            <p className="profile-action-modal-description font-XS-regular">
                                Escreva uma mensagem para {recipientLabel}.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="profile-gallery-picker__close"
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

                    <div className="profile-message-modal__compose">
                        <label className="profile-action-modal-field">
                            <span className="font-S-bold profile-action-modal-label">
                                Titulo
                            </span>
                            <input
                                className="profile-action-modal-input font-S-regular"
                                value={title}
                                maxLength={120}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Titulo da mensagem"
                            />
                        </label>

                        <label className="profile-action-modal-field">
                            <span className="font-S-bold profile-action-modal-label">
                                Conteudo
                            </span>
                            <div className="profile-message-modal__toolbar">
                                <button
                                    type="button"
                                    className="profile-message-modal__tool font-S-bold"
                                    onClick={() => wrapSelection('**', '**')}
                                >
                                    B
                                </button>
                                <button
                                    type="button"
                                    className="profile-message-modal__tool profile-message-modal__tool--italic font-S-bold"
                                    onClick={() => wrapSelection('*', '*')}
                                >
                                    I
                                </button>
                                <button
                                    type="button"
                                    className="profile-message-modal__tool font-S-bold"
                                    onClick={() => wrapSelection('~~', '~~')}
                                >
                                    S
                                </button>
                                <select
                                    className="profile-message-modal__tool-select font-XXS-regular"
                                    defaultValue=""
                                    onChange={(event) => {
                                        applyHeading(event.target.value);
                                        event.target.value = '';
                                    }}
                                >
                                    <option value="">Tamanho</option>
                                    <option value="">Normal</option>
                                    <option value="#">Grande</option>
                                    <option value="##">Medio</option>
                                    <option value="###">Pequeno</option>
                                </select>
                            </div>
                            <textarea
                                ref={textareaRef}
                                className="profile-action-modal-textarea font-S-regular"
                                value={content}
                                onChange={(event) => setContent(event.target.value)}
                                placeholder="Escreva sua mensagem aqui..."
                            />
                        </label>

                        {error ? (
                            <span className="font-XXS-regular profile-action-modal-error">
                                {error}
                            </span>
                        ) : null}
                        {successMessage ? (
                            <span className="font-XXS-regular profile-message-modal__success">
                                {successMessage}
                            </span>
                        ) : null}
                    </div>

                    <div className="profile-action-modal-buttons">
                        <button
                            type="button"
                            onClick={() => {
                                void handleSubmit();
                            }}
                            disabled={submitting}
                            className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                        >
                            {submitting ? (
                                <LoadingDots label="Enviando mensagem" />
                            ) : (
                                'Enviar mensagem'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="font-S-bold form-button-cancel button-L-fill w-full"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card profile-action-modal-card--messages"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="profile-gallery-picker__header">
                    <div className="profile-gallery-picker__copy">
                        <h1 className="profile-action-modal-title font-L-semibold">
                            Mensagens
                        </h1>
                        <p className="profile-action-modal-description font-XS-regular">
                            Abra uma mensagem para ler o conteudo completo.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="profile-gallery-picker__close"
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

                {loading ? (
                    <div className="profile-message-modal__loading">
                        <LoadingDots label="Carregando mensagens" />
                    </div>
                ) : (
                    <div className="profile-message-modal__layout">
                        <div className="profile-message-modal__list">
                            {messages.length === 0 ? (
                                <div className="profile-message-modal__empty">
                                    <p className="font-S-regular text-color-greyScale/200">
                                        Nenhuma mensagem encontrada.
                                    </p>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const sender = senderMap[message.userId] ?? null;
                                    const senderLabel =
                                        sender?.nickname ||
                                        sender?.username ||
                                        'Aventureiro';

                                    return (
                                        <button
                                            key={message.messageId}
                                            type="button"
                                            className={`profile-message-modal__item${
                                                selectedMessageId === message.messageId
                                                    ? ' profile-message-modal__item--active'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                setSelectedMessageId(message.messageId)
                                            }
                                        >
                                            <div className="profile-message-modal__item-avatar">
                                                <RankedAvatarFrame
                                                    image={getSenderImage(sender)}
                                                    alt={senderLabel}
                                                    rank={getSenderRank(sender)}
                                                    variant="avatar"
                                                    sizes="3.25rem"
                                                />
                                            </div>
                                            <div className="profile-message-modal__item-copy">
                                                <span className="font-XS-bold">
                                                    {message.title}
                                                </span>
                                                <span className="font-XXS-regular">
                                                    {senderLabel}
                                                </span>
                                                <span className="font-XXS-regular">
                                                    {formatDate(message.timestamp)}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        <div className="profile-message-modal__detail">
                            {selectedMessage ? (
                                <>
                                    <div className="profile-message-modal__detail-header">
                                        <div className="profile-message-modal__detail-meta">
                                            <div className="profile-message-modal__detail-avatar">
                                                <RankedAvatarFrame
                                                    image={getSenderImage(selectedSender)}
                                                    alt={
                                                        selectedSender?.nickname ||
                                                        'Remetente'
                                                    }
                                                    rank={getSenderRank(selectedSender)}
                                                    variant="avatar"
                                                    sizes="4rem"
                                                />
                                            </div>
                                            <div className="profile-message-modal__detail-copy">
                                                <h2 className="font-L-bold">
                                                    {selectedMessage.title}
                                                </h2>
                                                <span className="font-XS-regular">
                                                    {selectedSender?.nickname ||
                                                        selectedSender?.username ||
                                                        'Aventureiro'}
                                                </span>
                                                <span className="font-XXS-regular">
                                                    {formatDate(
                                                        selectedMessage.timestamp
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="profile-message-modal__delete"
                                            onClick={() => {
                                                void handleDeleteMessage();
                                            }}
                                            disabled={
                                                deletingMessageId ===
                                                selectedMessage.messageId
                                            }
                                            aria-label="Excluir mensagem"
                                        >
                                            <Image
                                                src={TrashSvg}
                                                alt=""
                                                width={18}
                                                height={18}
                                            />
                                        </button>
                                    </div>

                                    <div className="profile-message-modal__body">
                                        {normalizeContent(selectedMessage.content).map(
                                            (line, index) =>
                                                renderMessageLine(line, index)
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="profile-message-modal__empty">
                                    <p className="font-S-regular text-color-greyScale/200">
                                        Selecione uma mensagem para ler.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {error ? (
                    <span className="font-XXS-regular profile-action-modal-error">
                        {error}
                    </span>
                ) : null}
            </div>
        </div>
    );
}
