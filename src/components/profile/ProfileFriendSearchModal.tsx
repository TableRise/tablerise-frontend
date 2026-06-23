'use client';

import { FormEvent, useContext, useState } from 'react';
import Image from 'next/image';
import SearchLightIcon from '@assets/icons/nav/search-blue.svg?url';
import SearchDarkIcon from '@assets/icons/nav/search-blue-dark.svg?url';
import LoadingDots from '@/components/common/LoadingDots';
import RankedAvatarFrame from '@/components/common/RankedAvatarFrame';
import TableriseContext from '@/context/TableriseContext';
import { searchUserByNickname } from '@/server/users/collections';
import type { DatabaseUserWithDetails } from '@/types/shared/entities';
import { defaultProfileImage } from '@/components/profile/profilePageHelpers';
import '@/components/profile/styles/ProfileActionModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

type ProfileFriendSearchModalProps = {
    onClose: () => void;
    onSelectUser: (userId: string) => void;
};

function getResultLabel(user: DatabaseUserWithDetails | null): string {
    return user?.nickname ?? user?.username ?? 'Sem nickname';
}

export default function ProfileFriendSearchModal({
    onClose,
    onSelectUser,
}: ProfileFriendSearchModalProps): JSX.Element {
    useBodyScrollLock();
    const { themeMode } = useContext(TableriseContext);
    const [nickname, setNickname] = useState('');
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<DatabaseUserWithDetails | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const searchIcon = themeMode === 'dark' ? SearchDarkIcon : SearchLightIcon;
    const resultLabel = getResultLabel(result);

    const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();

        const trimmedNickname = nickname.trim();

        if (!trimmedNickname) {
            setError('Digite um nickname para procurar.');
            setResult(null);
            setHasSearched(false);
            return;
        }

        setSearching(true);
        setError('');
        setResult(null);
        setHasSearched(false);

        try {
            const foundUser = await searchUserByNickname(trimmedNickname);
            setResult(foundUser);
            setHasSearched(true);
        } catch (searchError: Error | any) {
            setError(searchError?.message ?? 'Não foi possivel procurar aventureiros');
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card profile-action-modal-card--friend-search"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="profile-gallery-picker__header">
                    <div className="profile-gallery-picker__copy">
                        <h1 className="profile-action-modal-title font-L-semibold">
                            Procurar aventureiros
                        </h1>
                        <p className="profile-action-modal-description font-XS-regular">
                            Procure um aventureiro pelo nickname para visitar o perfil.
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

                <form
                    className="profile-friend-search-modal__form"
                    onSubmit={(event) => {
                        void handleSubmit(event);
                    }}
                >
                    <div className="profile-friend-search-modal__controls">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(event) => setNickname(event.target.value)}
                            className="profile-action-modal-input profile-friend-search-modal__input"
                            placeholder="Digite o nickname"
                            aria-label="Nickname do aventureiro"
                            disabled={searching}
                        />
                        <button
                            type="submit"
                            className="profile-friend-search-modal__submit"
                            aria-label="Procurar aventureiro"
                            disabled={searching}
                        >
                            <Image src={searchIcon} alt="" width={22} height={22} />
                        </button>
                    </div>

                    {error ? (
                        <span className="font-XXS-regular profile-action-modal-error">
                            {error}
                        </span>
                    ) : null}
                </form>

                <div className="profile-friend-search-modal__body">
                    {searching ? (
                        <div className="profile-friend-search-modal__state">
                            <LoadingDots label="Procurando aventureiro" />
                        </div>
                    ) : result ? (
                        <button
                            type="button"
                            className="profile-friend-search-modal__result"
                            onClick={() => onSelectUser(result.userId)}
                        >
                            <div className="profile-friend-search-modal__avatar">
                                <RankedAvatarFrame
                                    image={result.picture?.link ?? defaultProfileImage}
                                    alt={resultLabel}
                                    rank={result.details?.rank ?? null}
                                    variant="profile"
                                    sizes="4rem"
                                />
                            </div>
                            <div className="profile-friend-search-modal__copy">
                                <span className="font-S-bold">{resultLabel}</span>
                            </div>
                        </button>
                    ) : hasSearched ? (
                        <div className="profile-friend-search-modal__state">
                            <p className="font-S-regular text-color-greyScale/200">
                                Nenhum aventureiro encontrado com esse nickname.
                            </p>
                        </div>
                    ) : (
                        <div className="profile-friend-search-modal__state">
                            <p className="font-S-regular text-color-greyScale/200">
                                Digite um nickname e use a busca para encontrar um perfil.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
