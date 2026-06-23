'use client';

import { type RefObject, useContext } from 'react';
import Image from 'next/image';
import EditIcon from '@assets/icons/sys/edit.svg?url';
import EditDarkIcon from '@assets/icons/sys/edit-dark.svg?url';
import MailDarkIcon from '@assets/icons/sys/mail-dark.svg?url';
import AddFriendLightIcon from '@assets/icons/social/add-friend-light.svg?url';
import AddFriendDarkIcon from '@assets/icons/social/add-friend-dark.svg?url';
import FriendRequestsIcon from '@assets/icons/social/friends-request.svg?url';
import SettingsDarkIcon from '@assets/icons/menu-panel-lobby/settings-dark.svg?url';
import GalleryIcon from '@assets/icons/sys/gallery.svg?url';
import RankedAvatarFrame from '@/components/common/RankedAvatarFrame';
import ProfileBadgePopover from '@/components/profile/ProfileBadgePopover';
import type { DatabaseUserWithDetails } from '@/types/shared/entities';
import TableriseContext from '@/context/TableriseContext';
import {
    badgeMap,
    defaultProfileImage,
    formatBadgeName,
    getBadgeProgress,
    getProfileTitleTextStyle,
} from '@/components/profile/profilePageHelpers';
import { getUserRank } from '@/utils/userRank';

type ProfileHeroSectionProps = {
    user: DatabaseUserWithDetails;
    profileName: string;
    profileHandle: string;
    biography: string;
    level: number;
    xp: number;
    activeTitle: string;
    activeTitleType: string;
    profileCover: string;
    accountStatus: string;
    accountStatusClass: string;
    isOwnProfile: boolean;
    pictureUploading: boolean;
    pictureFeedback: string;
    earnedBadgeKeys: string[];
    openBadgePopoverId: string | null;
    pictureInputRef: RefObject<HTMLInputElement>;
    onOpenBadgePopover: (popoverId: string) => void;
    onCloseBadgePopover: () => void;
    onPictureClick: () => void;
    onSelectImage: (file: File) => void;
    onOpenProfileControls: () => void;
    showMessageAction: boolean;
    messageBadgeCount?: number;
    onOpenMessages: () => void;
    showFriendRequestsInboxAction: boolean;
    friendRequestsBadgeCount?: number;
    onOpenFriendRequestsInbox: () => void;
    showProfileControlsAction: boolean;
    showGalleryAction: boolean;
    onOpenGallery: () => void;
    showFriendRequestAction: boolean;
    onOpenFriendRequest: () => void;
};

function buildBadgePopoverId(scope: 'hero', badgeKey: string): string {
    return `${scope}:${badgeKey}`;
}

export default function ProfileHeroSection({
    user,
    profileName,
    profileHandle,
    biography,
    level,
    xp,
    activeTitle,
    activeTitleType,
    profileCover,
    accountStatus,
    accountStatusClass,
    isOwnProfile,
    pictureUploading,
    pictureFeedback,
    earnedBadgeKeys,
    openBadgePopoverId,
    pictureInputRef,
    onOpenBadgePopover,
    onCloseBadgePopover,
    onPictureClick,
    onSelectImage,
    onOpenProfileControls,
    showMessageAction,
    messageBadgeCount = 0,
    onOpenMessages,
    showFriendRequestsInboxAction,
    friendRequestsBadgeCount = 0,
    onOpenFriendRequestsInbox,
    showProfileControlsAction,
    showGalleryAction,
    onOpenGallery,
    showFriendRequestAction,
    onOpenFriendRequest,
}: ProfileHeroSectionProps): JSX.Element {
    const { themeMode } = useContext(TableriseContext);

    const formatBadgeCount = (count: number): string => {
        if (count > 99) return '99+';
        return String(count);
    };

    return (
        <section
            className={`profile-hero${profileCover ? ' profile-hero--has-cover' : ''}`}
        >
            {profileCover ? (
                <div className="profile-hero__cover" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={profileCover}
                        alt=""
                        className="profile-hero__cover-image"
                    />
                    <div className="profile-hero__cover-overlay" />
                    <div className="profile-hero__cover-fade" />
                </div>
            ) : null}
            <div className="profile-hero__panel">
                {showMessageAction ||
                showFriendRequestsInboxAction ||
                showProfileControlsAction ||
                showGalleryAction ||
                showFriendRequestAction ? (
                    <div className="profile-hero__quick-actions">
                        {showMessageAction ? (
                            <div className="profile-hero__action-shell">
                                <button
                                    type="button"
                                    className="profile-hero__mail-button"
                                    onClick={onOpenMessages}
                                    aria-label="Abrir mensagens"
                                >
                                    <Image
                                        src={MailDarkIcon}
                                        alt=""
                                        width={22}
                                        height={22}
                                    />
                                </button>
                                {messageBadgeCount > 0 ? (
                                    <span className="font-XXS-bold profile-hero__action-badge">
                                        {formatBadgeCount(messageBadgeCount)}
                                    </span>
                                ) : null}
                            </div>
                        ) : null}
                        {showFriendRequestsInboxAction ? (
                            <div className="profile-hero__action-shell">
                                <button
                                    type="button"
                                    className="profile-hero__requests-button"
                                    onClick={onOpenFriendRequestsInbox}
                                    aria-label="Abrir solicitações de amizade"
                                >
                                    <Image
                                        src={FriendRequestsIcon}
                                        alt=""
                                        width={22}
                                        height={22}
                                    />
                                </button>
                                {friendRequestsBadgeCount > 0 ? (
                                    <span className="font-XXS-bold profile-hero__action-badge">
                                        {formatBadgeCount(friendRequestsBadgeCount)}
                                    </span>
                                ) : null}
                            </div>
                        ) : null}
                        {showProfileControlsAction ? (
                            <div className="profile-hero__action-shell">
                                <button
                                    type="button"
                                    className="profile-hero__settings-button"
                                    onClick={onOpenProfileControls}
                                    aria-label="Abrir controle de perfil"
                                >
                                    <Image
                                        src={SettingsDarkIcon}
                                        alt=""
                                        width={22}
                                        height={22}
                                    />
                                </button>
                            </div>
                        ) : null}
                        {showGalleryAction ? (
                            <div className="profile-hero__action-shell">
                                <button
                                    type="button"
                                    className="profile-hero__gallery-button"
                                    onClick={onOpenGallery}
                                    aria-label="Abrir galeria"
                                >
                                    <Image
                                        src={GalleryIcon}
                                        alt=""
                                        width={22}
                                        height={22}
                                    />
                                </button>
                            </div>
                        ) : null}
                        {showFriendRequestAction ? (
                            <div className="profile-hero__action-shell">
                                <button
                                    type="button"
                                    className="profile-hero__friend-button"
                                    onClick={onOpenFriendRequest}
                                    aria-label="Enviar solicitação de amizade"
                                >
                                    <Image
                                        src={
                                            themeMode === 'dark'
                                                ? AddFriendDarkIcon
                                                : AddFriendLightIcon
                                        }
                                        alt=""
                                        width={22}
                                        height={22}
                                    />
                                </button>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                <div className="profile-hero__media">
                    <div
                        className={`profile-hero__avatar${
                            isOwnProfile ? ' profile-hero__avatar--editable' : ''
                        }`}
                    >
                        <RankedAvatarFrame
                            image={user.picture?.link ?? defaultProfileImage}
                            alt={profileName || user.nickname}
                            rank={getUserRank(user)}
                            variant="profile"
                            sizes="(max-width: 768px) 14rem, 16rem"
                            priority={true}
                        />
                        {isOwnProfile ? (
                            <>
                                <button
                                    type="button"
                                    className="profile-hero__avatar-overlay"
                                    onClick={onPictureClick}
                                    disabled={pictureUploading}
                                    aria-label="Editar foto do perfil"
                                >
                                    <Image
                                        src={
                                            themeMode === 'dark' ? EditDarkIcon : EditIcon
                                        }
                                        alt=""
                                        width={32}
                                        height={32}
                                    />
                                </button>
                                <input
                                    ref={pictureInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];

                                        if (!file) return;
                                        onSelectImage(file);
                                        event.target.value = '';
                                    }}
                                />
                            </>
                        ) : null}
                    </div>
                    {isOwnProfile && pictureFeedback ? (
                        <p className="font-XXS-regular profile-hero__avatar-feedback">
                            {pictureFeedback}
                        </p>
                    ) : null}
                    <div className="profile-hero__level-block">
                        <p className="font-XXS-bold profile-hero__level-line">
                            Nível: {level} / XP: {xp}
                        </p>
                        <p
                            className={`font-XS-bold profile-hero__title-line profile-hero__title-line--${activeTitleType}`}
                            style={getProfileTitleTextStyle(activeTitleType)}
                        >
                            {activeTitle || 'Sem título'}
                        </p>
                    </div>
                </div>

                <div className="profile-hero__copy">
                    <div className="profile-hero__identity">
                        <h1 className="font-L-bold profile-hero__name">
                            {profileName || 'Aventureiro sem nome'}
                        </h1>
                        {user.email ? (
                            <p className="font-XS-regular profile-hero__email">
                                {user.email}
                            </p>
                        ) : null}
                        <p className="font-XS-bold profile-hero__handle">
                            {profileHandle || 'Sem nickname'}
                        </p>
                        <p className="font-XS-regular profile-hero__status">
                            <strong>Status da conta:</strong>{' '}
                            <span className={accountStatusClass}>{accountStatus}</span>
                        </p>
                        <p className="font-S-regular profile-hero__biography">
                            {biography ||
                                'Este aventureiro ainda não adicionou uma biografia.'}
                        </p>
                    </div>

                    {earnedBadgeKeys.length > 0 ? (
                        <div className="profile-hero__badges" aria-label="Badges ativas">
                            {earnedBadgeKeys.map((badgeKey) => {
                                const popoverId = buildBadgePopoverId('hero', badgeKey);

                                return (
                                    <ProfileBadgePopover
                                        key={badgeKey}
                                        popoverId={popoverId}
                                        label={formatBadgeName(badgeKey)}
                                        imageSrc={badgeMap[badgeKey].colorful}
                                        description={badgeMap[badgeKey].description}
                                        progress={getBadgeProgress(
                                            badgeKey,
                                            user.details?.gameInfo
                                        )}
                                        variant="hero"
                                        isOpen={openBadgePopoverId === popoverId}
                                        onOpen={onOpenBadgePopover}
                                        onClose={onCloseBadgePopover}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <p className="font-XXS-regular profile-hero__empty-badges">
                            Este usuário ainda não possui badges ativas.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
