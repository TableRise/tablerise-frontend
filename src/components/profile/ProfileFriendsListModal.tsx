'use client';

import type { UserFriendRecord } from '@/server/users/collections';
import ProfileFriendCard from '@/components/profile/ProfileFriendCard';
import '@/components/profile/styles/ProfileActionModal.css';

type ProfileFriendsListModalProps = {
    friends: UserFriendRecord[];
    currentUserId: string;
    removingFriendId: string | null;
    favoriteLoadingFriendId: string | null;
    canRemoveFriend?: boolean;
    canFavoriteFriend?: boolean;
    onClose: () => void;
    onRemoveFriend: (targetUserId: string) => void;
    onToggleFavorite: (targetUserId: string) => void;
};

export default function ProfileFriendsListModal({
    friends,
    currentUserId,
    removingFriendId,
    favoriteLoadingFriendId,
    canRemoveFriend = true,
    canFavoriteFriend = false,
    onClose,
    onRemoveFriend,
    onToggleFavorite,
}: ProfileFriendsListModalProps): JSX.Element {
    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card profile-action-modal-card--friends-list"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="profile-gallery-picker__header">
                    <div className="profile-gallery-picker__copy">
                        <h1 className="profile-action-modal-title font-L-semibold">
                            Lista completa de amigos
                        </h1>
                        <p className="profile-action-modal-description font-XS-regular">
                            {canRemoveFriend
                                ? 'Clique em um avatar para ver o perfil ou desfazer a amizade.'
                                : 'Clique em um avatar para ver o perfil deste amigo.'}
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

                {friends.length === 0 ? (
                    <div className="profile-gallery-picker__empty">
                        <p className="font-S-regular text-color-greyScale/200">
                            Nenhum amigo ativo encontrado.
                        </p>
                    </div>
                ) : (
                    <div className="profile-friends-modal__grid">
                        {friends.map((friend) => (
                            <ProfileFriendCard
                                key={friend.userId}
                                friend={friend}
                                currentUserId={currentUserId}
                                isRemoving={removingFriendId === friend.userId}
                                isFavoriteLoading={
                                    favoriteLoadingFriendId === friend.userId
                                }
                                variant="grid"
                                canRemoveFriend={canRemoveFriend}
                                canFavoriteFriend={canFavoriteFriend}
                                onRemoveFriend={onRemoveFriend}
                                onToggleFavorite={onToggleFavorite}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
