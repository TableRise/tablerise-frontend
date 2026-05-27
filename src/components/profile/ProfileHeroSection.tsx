'use client';

import { type RefObject } from 'react';
import Image from 'next/image';
import EditIcon from '@assets/icons/sys/edit.svg?url';
import RankedAvatarFrame from '@/components/common/RankedAvatarFrame';
import ProfileBadgePopover from '@/components/profile/ProfileBadgePopover';
import type { DatabaseUserWithDetails } from '@/types/shared/entities';
import {
    badgeMap,
    defaultProfileImage,
    formatBadgeName,
} from '@/components/profile/profilePageHelpers';
import { getUserRank } from '@/utils/userRank';

type ProfileHeroSectionProps = {
    user: DatabaseUserWithDetails;
    profileName: string;
    profileHandle: string;
    biography: string;
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
    onEditBiography: () => void;
    onRequestEmailUpdate: () => void;
    onRequestPasswordUpdate: () => void;
    onRequestToggleTwoFactor: () => void;
    onRequestDeleteAccount: () => void;
};

function buildBadgePopoverId(scope: 'hero', badgeKey: string): string {
    return `${scope}:${badgeKey}`;
}

export default function ProfileHeroSection({
    user,
    profileName,
    profileHandle,
    biography,
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
    onEditBiography,
    onRequestEmailUpdate,
    onRequestPasswordUpdate,
    onRequestToggleTwoFactor,
    onRequestDeleteAccount,
}: ProfileHeroSectionProps): JSX.Element {
    const hasExternalProvider = user.providerId !== null && user.providerId !== undefined;

    return (
        <section className="profile-hero">
            <div className="profile-hero__cover" />
            <div className="profile-hero__panel">
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
                                    <Image src={EditIcon} alt="" width={32} height={32} />
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
                        {isOwnProfile ? (
                            <div className="profile-hero__actions">
                                <button
                                    type="button"
                                    className="font-XS-regular profile-hero__action"
                                    onClick={onEditBiography}
                                >
                                    Atualizar biografia e nome
                                </button>
                                <span
                                    className="font-XS-regular profile-hero__actions-separator"
                                    aria-hidden="true"
                                >
                                    |
                                </span>
                                {!hasExternalProvider ? (
                                    <>
                                        <button
                                            type="button"
                                            className="font-XS-regular profile-hero__action"
                                            onClick={onRequestEmailUpdate}
                                        >
                                            Atualizar email
                                        </button>
                                        <span
                                            className="font-XS-regular profile-hero__actions-separator"
                                            aria-hidden="true"
                                        >
                                            |
                                        </span>
                                        <button
                                            type="button"
                                            className="font-XS-regular profile-hero__action"
                                            onClick={onRequestPasswordUpdate}
                                        >
                                            Atualizar senha
                                        </button>
                                        <span
                                            className="font-XS-regular profile-hero__actions-separator"
                                            aria-hidden="true"
                                        >
                                            |
                                        </span>
                                    </>
                                ) : null}
                                <button
                                    type="button"
                                    className="font-XS-regular profile-hero__action"
                                    onClick={onRequestToggleTwoFactor}
                                >
                                    {user.twoFactorSecret?.active
                                        ? 'Desabilitar dois fatores'
                                        : 'Habilitar dois fatores'}
                                </button>
                                <span
                                    className="font-XS-regular profile-hero__actions-separator"
                                    aria-hidden="true"
                                >
                                    |
                                </span>
                                <button
                                    type="button"
                                    className="font-XS-regular profile-hero__action profile-hero__action--danger"
                                    onClick={onRequestDeleteAccount}
                                >
                                    Deletar conta
                                </button>
                            </div>
                        ) : null}
                        <p className="font-XS-bold profile-hero__handle">
                            {profileHandle || 'Sem nickname'}
                        </p>
                        <p className="font-XS-regular">
                            <strong>Status da conta:</strong>{' '}
                            <span className={accountStatusClass}>{accountStatus}</span>
                        </p>
                        <p className="font-S-regular text-color-greyScale/700">
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
