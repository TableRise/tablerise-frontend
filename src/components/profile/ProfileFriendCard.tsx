'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import RankedAvatarFrame from '@/components/common/RankedAvatarFrame';
import { defaultProfileImage } from '@/components/profile/profilePageHelpers';
import type { UserFriendRecord } from '@/server/users/collections';

type ProfileFriendCardProps = {
    friend: UserFriendRecord;
    currentUserId: string;
    isRemoving: boolean;
    isFavoriteLoading?: boolean;
    variant?: 'carousel' | 'grid';
    canRemoveFriend?: boolean;
    canFavoriteFriend?: boolean;
    onRemoveFriend: (targetUserId: string) => void;
    onToggleFavorite: (targetUserId: string) => void;
};

function getFriendImage(friend: UserFriendRecord): string {
    return friend.picture?.trim() || defaultProfileImage;
}

export default function ProfileFriendCard({
    friend,
    currentUserId,
    isRemoving,
    isFavoriteLoading = false,
    variant = 'carousel',
    canRemoveFriend = true,
    canFavoriteFriend = false,
    onRemoveFriend,
    onToggleFavorite,
}: ProfileFriendCardProps): JSX.Element {
    const router = useRouter();
    const [popoverOpen, setPopoverOpen] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!popoverOpen) return;

        function handlePointerDown(event: PointerEvent) {
            if (!cardRef.current?.contains(event.target as Node)) {
                setPopoverOpen(false);
            }
        }

        document.addEventListener('pointerdown', handlePointerDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [popoverOpen]);

    const friendHandle = `${friend.nickname ?? ''}${friend.tag ?? ''}`.trim();

    return (
        <div
            ref={cardRef}
            className={`profile-friend-card profile-friend-card--${variant}`}
        >
            <button
                type="button"
                className="profile-friend-card__avatar-button"
                onClick={() => setPopoverOpen((current) => !current)}
                aria-label={`Abrir acoes para ${friendHandle || 'amigo'}`}
            >
                <RankedAvatarFrame
                    image={getFriendImage(friend)}
                    alt={friendHandle || 'Amigo'}
                    rank={friend.rank}
                    variant="profile"
                    sizes="(max-width: 768px) 6.5rem, 7rem"
                />
            </button>

            <span className="font-XS-bold profile-friend-card__label">
                {friend.nickname || 'Sem nickname'}
            </span>

            {popoverOpen ? (
                <div className="profile-friend-card__popover">
                    <button
                        type="button"
                        className="font-XXS-bold profile-friend-card__popover-action"
                        onClick={() => {
                            setPopoverOpen(false);
                            router.push(`/profile/${friend.userId || currentUserId}`);
                        }}
                    >
                        Ver perfil
                    </button>
                    {canFavoriteFriend ? (
                        <button
                            type="button"
                            className="font-XXS-bold profile-friend-card__popover-action"
                            onClick={() => {
                                setPopoverOpen(false);
                                onToggleFavorite(friend.userId);
                            }}
                            disabled={isFavoriteLoading}
                        >
                            {isFavoriteLoading
                                ? friend.favorite
                                    ? 'Desfavoritando...'
                                    : 'Favoritando...'
                                : friend.favorite
                                ? 'Desfavoritar'
                                : 'Favoritar'}
                        </button>
                    ) : null}
                    {canRemoveFriend ? (
                        <button
                            type="button"
                            className="font-XXS-bold profile-friend-card__popover-action profile-friend-card__popover-action--danger"
                            onClick={() => {
                                setPopoverOpen(false);
                                onRemoveFriend(friend.userId);
                            }}
                            disabled={isRemoving}
                        >
                            {isRemoving ? 'Desfazendo...' : 'Desfazer amizade'}
                        </button>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
