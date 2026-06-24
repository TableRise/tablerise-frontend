'use client';

import { useContext, useState } from 'react';
import Image from 'next/image';
import SearchLightIcon from '@assets/icons/nav/search-blue.svg?url';
import SearchDarkIcon from '@assets/icons/nav/search-blue-dark.svg?url';
import RankedAvatarFrame from '@/components/common/RankedAvatarFrame';
import TableriseContext from '@/context/TableriseContext';
import { defaultProfileImage } from '@/components/profile/profilePageHelpers';
import type { UserFriendRecord } from '@/server/users/collections';
import '@/components/profile/styles/ProfileActionModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

type ProfileFriendRequestsInboxModalProps = {
    requests: UserFriendRecord[];
    onClose: () => void;
    onOpenSearch: () => void;
    onAccept: (targetUserId: string) => Promise<void>;
    onReject: (targetUserId: string) => Promise<void>;
};

function getRequestImage(request: UserFriendRecord): string {
    return request.picture?.trim() || defaultProfileImage;
}

export default function ProfileFriendRequestsInboxModal({
    requests,
    onClose,
    onOpenSearch,
    onAccept,
    onReject,
}: ProfileFriendRequestsInboxModalProps): JSX.Element {
    useBodyScrollLock();
    const { themeMode } = useContext(TableriseContext);
    const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleRequestAction = async (
        requestUserId: string,
        action: 'accept' | 'reject'
    ) => {
        setProcessingRequestId(requestUserId);
        setError('');

        try {
            if (action === 'accept') {
                await onAccept(requestUserId);
            } else {
                await onReject(requestUserId);
            }
        } catch (requestError: Error | any) {
            setError(
                requestError?.message ??
                    'Não foi possivel atualizar esta solicitação de amizade'
            );
        } finally {
            setProcessingRequestId(null);
        }
    };

    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card profile-action-modal-card--friends-list"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="profile-gallery-picker__header">
                    <div className="profile-gallery-picker__copy">
                        <h1 className="profile-action-modal-title font-L-semibold">
                            Solicitações de amizade
                        </h1>
                        <div className="profile-gallery-picker__actions">
                            <button
                                type="button"
                                onClick={onOpenSearch}
                                className="profile-gallery-picker__close"
                                aria-label="Procurar aventureiros"
                            >
                                <Image
                                    src={
                                        themeMode === 'dark'
                                            ? SearchDarkIcon
                                            : SearchLightIcon
                                    }
                                    alt=""
                                    width={20}
                                    height={20}
                                />
                            </button>
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
                    </div>
                    <p className="profile-gallery-description__modal font-XS-regular">
                        Aceite ou recuse os pedidos pendentes recebidos no seu perfil.
                    </p>
                </div>

                {requests.length === 0 ? (
                    <div className="profile-gallery-picker__empty">
                        <p className="font-S-regular text-color-greyScale/200">
                            Nenhuma solicitação pendente encontrada.
                        </p>
                    </div>
                ) : (
                    <div className="profile-friend-requests-modal__list">
                        {requests.map((request) => {
                            const requestHandle = `${request.nickname ?? ''}${
                                request.tag ?? ''
                            }`.trim();
                            const isProcessing = processingRequestId === request.userId;

                            return (
                                <div
                                    key={request.userId}
                                    className="profile-friend-requests-modal__item"
                                >
                                    <div className="profile-friend-requests-modal__identity">
                                        <div className="profile-friend-requests-modal__avatar">
                                            <RankedAvatarFrame
                                                image={getRequestImage(request)}
                                                alt={requestHandle || 'solicitação'}
                                                rank={request.rank}
                                                variant="avatar"
                                                sizes="4.25rem"
                                            />
                                        </div>
                                        <div className="profile-friend-requests-modal__copy">
                                            <span className="font-S-bold">
                                                {request.nickname || 'Sem nickname'}
                                            </span>
                                            <span className="font-XXS-regular">
                                                {requestHandle || 'Sem identificador'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="profile-friend-requests-modal__actions">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void handleRequestAction(
                                                    request.userId,
                                                    'accept'
                                                );
                                            }}
                                            disabled={isProcessing}
                                            className="font-XXS-bold profile-friend-requests-modal__button profile-friend-requests-modal__button--accept"
                                        >
                                            {isProcessing ? 'Atualizando...' : 'Aceitar'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void handleRequestAction(
                                                    request.userId,
                                                    'reject'
                                                );
                                            }}
                                            disabled={isProcessing}
                                            className="font-XXS-bold profile-friend-requests-modal__button profile-friend-requests-modal__button--reject"
                                        >
                                            {isProcessing ? 'Atualizando...' : 'Recusar'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
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
