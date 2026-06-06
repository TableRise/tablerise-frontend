'use client';

import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getUser } from '@/server/users/get-user';
import { getCampaignsByUserId } from '@/server/campaigns/get-campaigns';
import {
    getCharacterById,
    type FullCharacterDnd,
} from '@/server/characters/get-characters';
import type { DatabaseUserWithDetails } from '@/types/shared/entities';
import TableriseContext from '@/context/TableriseContext';
import CharacterDetailModal from '@/components/lobby/CharacterDetailModal';
import ImageCropModal from '@/components/common/ImageCropModal';
import LoadingDots from '@/components/common/LoadingDots';
import CompleteUserModal from '@/components/login/CompleteUserModal';
import ProfileBadgePopover from '@/components/profile/ProfileBadgePopover';
import ProfileHeroSection from '@/components/profile/ProfileHeroSection';
import ProfileShowcaseSection from '@/components/profile/ProfileShowcaseSection';
import ProfileStateCard from '@/components/profile/ProfileStateCard';
import ProfileTwoFactorActivationModal from '@/components/profile/ProfileTwoFactorActivationModal';
import ProfileTwoFactorDisableModal from '@/components/profile/ProfileTwoFactorDisableModal';
import ProfileFlowWarningModal from '@/components/profile/ProfileFlowWarningModal';
import ProfileBiographyModal from '@/components/profile/ProfileBiographyModal';
import ProfileDeleteAccountModal from '@/components/profile/ProfileDeleteAccountModal';
import ProfileDeleteAccountVerificationModal from '@/components/profile/ProfileDeleteAccountVerificationModal';
import ProfileEmailUpdateModal from '@/components/profile/ProfileEmailUpdateModal';
import ProfileCoverModal from '@/components/profile/ProfileCoverModal';
import ProfileControlModal from '@/components/profile/ProfileControlModal';
import ProfilePasswordUpdateModal from '@/components/profile/ProfilePasswordUpdateModal';
import {
    badgeEntries,
    badgeMap,
    defaultProfileImage,
    formatAccountStatus,
    formatBadgeName,
    formatCampaignDate,
    getBadgeProgress,
    handleCardKeyDown,
    mapCharacter,
    mergeCampaigns,
    normalizeBirthdayInput,
    normalizeStoredUserId,
    normalizeUserDetails,
    type PendingProfileFlowWarning,
    type ProfileCampaign,
    type ProfileCharacter,
    type ProfileGateStep,
    type StoredUser,
} from '@/components/profile/profilePageHelpers';
import { updateUserPicture } from '@/server/users/update-user-picture';
import { removeUserCover } from '@/server/users/update-user-cover';
import type { ImageUploadIntent } from '@/utils/imageCrop';

type ProfilePageContentProps = {
    userId: string;
};

function buildBadgePopoverId(scope: 'catalog', badgeKey: string): string {
    return `${scope}:${badgeKey}`;
}

export default function ProfilePageContent({
    userId,
}: ProfilePageContentProps): JSX.Element {
    const router = useRouter();
    const { userCampaigns } = useContext(TableriseContext);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [user, setUser] = useState<DatabaseUserWithDetails | null>(null);
    const [campaigns, setCampaigns] = useState<ProfileCampaign[]>([]);
    const [characters, setCharacters] = useState<ProfileCharacter[]>([]);
    const [currentUserId, setCurrentUserId] = useState('');
    const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
    const [gateStep, setGateStep] = useState<ProfileGateStep>('none');
    const [biographyModalOpen, setBiographyModalOpen] = useState(false);
    const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
    const [deleteAccountVerificationModalOpen, setDeleteAccountVerificationModalOpen] =
        useState(false);
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [coverModalOpen, setCoverModalOpen] = useState(false);
    const [profileControlModalOpen, setProfileControlModalOpen] = useState(false);
    const [disableTwoFactorModalOpen, setDisableTwoFactorModalOpen] = useState(false);
    const [manualTwoFactorActivationOpen, setManualTwoFactorActivationOpen] =
        useState(false);
    const [pendingFlowWarning, setPendingFlowWarning] =
        useState<PendingProfileFlowWarning | null>(null);
    const [pictureUploading, setPictureUploading] = useState(false);
    const [pictureFeedback, setPictureFeedback] = useState('');
    const [coverActionLoading, setCoverActionLoading] = useState(false);
    const [coverFeedback, setCoverFeedback] = useState('');
    const [pendingImageCrop, setPendingImageCrop] = useState<{
        file: File;
        intent: ImageUploadIntent;
    } | null>(null);
    const [openBadgePopoverId, setOpenBadgePopoverId] = useState<string | null>(null);
    const pictureInputRef = useRef<HTMLInputElement>(null);
    const isOwnProfile =
        Boolean(currentUserId) &&
        (currentUserId === userId || currentUserId === (user?.userId ?? '').trim());

    useEffect(() => {
        try {
            const storedUserRaw = localStorage.getItem('userLogged');
            const storedUser = storedUserRaw
                ? (JSON.parse(storedUserRaw) as StoredUser | null)
                : null;
            setCurrentUserId(normalizeStoredUserId(storedUser));
        } catch {
            setCurrentUserId('');
        }
    }, []);

    useEffect(() => {
        if (!openBadgePopoverId) return;

        function handlePointerDown(event: PointerEvent) {
            const target = event.target;

            if (!(target instanceof Element)) return;
            if (target.closest('.profile-badge-popover')) return;

            setOpenBadgePopoverId(null);
        }

        document.addEventListener('pointerdown', handlePointerDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [openBadgePopoverId]);

    useEffect(() => {
        let mounted = true;

        async function loadProfile() {
            setLoading(true);
            setFetchError('');
            setUser(null);
            setCampaigns([]);
            setCharacters([]);
            setSelectedCharacterId(null);

            try {
                const fetchedUser = await getUser(userId);

                if (!mounted) return;

                if (!fetchedUser) {
                    setUser(null);
                    setCampaigns([]);
                    setCharacters([]);
                    return;
                }

                setUser(fetchedUser);

                const [campaignGroups, details] = await Promise.all([
                    getCampaignsByUserId(userId),
                    Promise.resolve(normalizeUserDetails(fetchedUser)),
                ]);

                if (!mounted) return;

                setCampaigns(mergeCampaigns(campaignGroups));

                const characterIds = Array.isArray(details?.gameInfo?.characters)
                    ? details.gameInfo.characters
                    : [];

                const fetchedCharacters = await Promise.all(
                    characterIds.map((characterId) => getCharacterById(characterId))
                );

                if (!mounted) return;

                setCharacters(
                    fetchedCharacters
                        .filter(
                            (character): character is FullCharacterDnd =>
                                character !== null
                        )
                        .map(mapCharacter)
                );
            } catch (error: Error | any) {
                if (!mounted) return;

                const errorMessage = String(error?.message ?? '').toLowerCase();

                if (errorMessage.includes('encontr')) {
                    setUser(null);
                    setCampaigns([]);
                    setCharacters([]);
                } else {
                    setFetchError('não foi possível carregar este perfil no momento.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            mounted = false;
        };
    }, [userId]);

    const userDetails = useMemo(() => normalizeUserDetails(user), [user]);
    const accessibleCampaignIds = useMemo(
        () =>
            new Set([
                ...userCampaigns.master.map((campaign) => campaign.campaignId),
                ...userCampaigns.player.map((campaign) => campaign.campaignId),
            ]),
        [userCampaigns.master, userCampaigns.player]
    );
    const earnedBadgeKeys = useMemo(() => {
        const rawBadges = userDetails?.gameInfo?.badges;

        if (!Array.isArray(rawBadges)) return [];

        return rawBadges.filter((badgeKey): badgeKey is string => badgeKey in badgeMap);
    }, [userDetails]);
    const badgeKeySet = useMemo(() => new Set(earnedBadgeKeys), [earnedBadgeKeys]);

    const refreshProfileUser = async (): Promise<DatabaseUserWithDetails | null> => {
        const refreshedUser = await getUser(userId);

        if (refreshedUser) {
            setUser(refreshedUser);
        }

        return refreshedUser;
    };

    const handleProfilePictureClick = () => {
        if (pictureUploading) return;
        pictureInputRef.current?.click();
    };

    const handleOpenProfileControls = () => {
        setCoverFeedback('');
        setProfileControlModalOpen(true);
    };

    const handleEditBiography = () => {
        setProfileControlModalOpen(false);
        setBiographyModalOpen(true);
    };

    const handleRequestEmailUpdate = () => {
        setProfileControlModalOpen(false);
        setPendingFlowWarning('update-email');
    };

    const handleRequestPasswordUpdate = () => {
        setProfileControlModalOpen(false);
        setPendingFlowWarning('update-password');
    };

    const handleRequestToggleTwoFactor = () => {
        setProfileControlModalOpen(false);

        if (user?.twoFactorSecret?.active) {
            setDisableTwoFactorModalOpen(true);
            return;
        }

        setPendingFlowWarning('enable-two-factor');
    };

    const handleCoverAction = () => {
        setCoverFeedback('');

        if (!profileCover) {
            setProfileControlModalOpen(false);
            setCoverModalOpen(true);
            return;
        }

        void (async () => {
            setCoverActionLoading(true);

            try {
                await removeUserCover(userId);
                await refreshProfileUser();
            } catch (error: Error | any) {
                setCoverFeedback(
                    error?.message ??
                        'Nao foi possivel remover o plano de fundo do perfil.'
                );
            } finally {
                setCoverActionLoading(false);
            }
        })();
    };

    const handleProfilePictureUpload = async (file: File) => {
        setPictureUploading(true);
        setPictureFeedback('');

        try {
            await updateUserPicture(userId, file);
            await refreshProfileUser();
            setPendingImageCrop(null);
        } catch (error: Error | any) {
            setPictureFeedback(
                error?.message ?? 'Nao foi possivel atualizar a foto do perfil.'
            );
            throw error;
        } finally {
            setPictureUploading(false);
        }
    };

    useEffect(() => {
        if (!isOwnProfile || !userDetails || !user) {
            setGateStep('none');
            return;
        }

        if (!(userDetails.firstName ?? '').trim()) {
            setGateStep('complete-profile');
            return;
        }

        setGateStep('none');
    }, [isOwnProfile, user, userDetails]);

    if (loading) {
        return (
            <ProfileStateCard
                title={<LoadingDots label="Carregando perfil" />}
                description="Estamos buscando as informações deste aventureiro."
            />
        );
    }

    if (fetchError) {
        return (
            <ProfileStateCard title="Erro ao carregar perfil" description={fetchError} />
        );
    }

    if (!user || !userDetails) {
        return (
            <ProfileStateCard
                title="Perfil não encontrado"
                description="não encontramos este perfil ou ele não está disponí­vel agora."
            />
        );
    }

    const profileName = `${userDetails.firstName ?? ''} ${
        userDetails.lastName ?? ''
    }`.trim();
    const profileHandle = `${user.nickname ?? ''}${user.tag ?? ''}`;
    const biography = userDetails.biography?.trim() ?? '';
    const profileCover = userDetails.cover?.link?.trim() ?? '';
    const accountStatus = formatAccountStatus(user.inProgress?.status);
    const accountStatusClass =
        user.inProgress?.status === 'done'
            ? 'text-color-support/success'
            : 'text-[#E8B022]';

    const campaignItems = campaigns.map((campaign) => (
        <article
            key={campaign.campaignId}
            className={`profile-campaign-card${
                accessibleCampaignIds.has(campaign.campaignId)
                    ? ' profile-campaign-card--interactive'
                    : ' profile-campaign-card--disabled'
            }`}
            onClick={() => {
                if (!accessibleCampaignIds.has(campaign.campaignId)) return;
                router.push(`/campaigns/lobby?campaignId=${campaign.campaignId}`);
            }}
            onKeyDown={(event) => {
                if (!accessibleCampaignIds.has(campaign.campaignId)) return;
                handleCardKeyDown(event, () =>
                    router.push(`/campaigns/lobby?campaignId=${campaign.campaignId}`)
                );
            }}
            role={accessibleCampaignIds.has(campaign.campaignId) ? 'button' : undefined}
            tabIndex={accessibleCampaignIds.has(campaign.campaignId) ? 0 : -1}
            aria-disabled={!accessibleCampaignIds.has(campaign.campaignId)}
        >
            <div className="profile-campaign-card__image">
                <Image
                    src={campaign.cover}
                    alt={campaign.title}
                    fill
                    sizes="(max-width: 768px) 80vw, 22rem"
                    style={{ objectFit: 'cover' }}
                />
                <div className="profile-campaign-card__fog" />
                {campaign.ageRestriction ? (
                    <span className="profile-campaign-card__age font-XXS-bold">
                        {campaign.ageRestriction}
                    </span>
                ) : null}
            </div>
            <div className="profile-campaign-card__body">
                <h3 className="font-M-semibold text-color-greyScale/50">
                    {campaign.title}
                </h3>
                <p className="font-XS-regular profile-campaign-card__description">
                    {campaign.description || 'Sem descrição disponível.'}
                </p>
                <div className="profile-campaign-card__meta">
                    <span className="font-XXS-bold">
                        {campaign.system
                            ? campaign.system.toUpperCase()
                            : 'Sistema não informado'}
                    </span>
                    <span className="font-XXS-regular">
                        {campaign.playerCount}/{campaign.playerAmountLimit ?? 0} jogadores
                    </span>
                </div>
                <span className="font-XXS-regular profile-campaign-card__date">
                    Próxima sessão: {formatCampaignDate(campaign.nextMatchDate)}
                </span>
            </div>
        </article>
    ));

    const characterItems = characters.map((character) => (
        <article
            key={character.characterId}
            className={`profile-character-card${
                isOwnProfile
                    ? ' profile-character-card--interactive'
                    : ' profile-character-card--disabled'
            }`}
            onClick={() => {
                if (!isOwnProfile) return;
                setSelectedCharacterId(character.characterId);
            }}
            onKeyDown={(event) => {
                if (!isOwnProfile) return;
                handleCardKeyDown(event, () =>
                    setSelectedCharacterId(character.characterId)
                );
            }}
            role={isOwnProfile ? 'button' : undefined}
            tabIndex={isOwnProfile ? 0 : -1}
            aria-disabled={!isOwnProfile}
        >
            <div className="profile-character-card__image">
                <Image
                    src={character.picture}
                    alt={character.name}
                    fill
                    sizes="(max-width: 768px) 80vw, 18rem"
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <div className="profile-character-card__body">
                <h3 className="font-M-semibold text-color-greyScale/50">
                    {character.name}
                </h3>
                <div className="profile-character-card__tags">
                    <span className="font-XXS-bold">{character.className}</span>
                    <span className="font-XXS-bold">{character.race}</span>
                </div>
                <span className="font-XS-regular text-color-greyScale/200">
                    Ní­vel {character.level}
                </span>
            </div>
        </article>
    ));

    const badgeItems = badgeEntries.map(([badgeKey, badgeVariant]) => {
        const earned = badgeKeySet.has(badgeKey);
        const popoverId = buildBadgePopoverId('catalog', badgeKey);

        return (
            <ProfileBadgePopover
                key={badgeKey}
                popoverId={popoverId}
                label={formatBadgeName(badgeKey)}
                imageSrc={earned ? badgeVariant.colorful : badgeVariant.blackandwhite}
                description={badgeVariant.description}
                progress={getBadgeProgress(badgeKey, userDetails?.gameInfo)}
                variant="card"
                isOpen={openBadgePopoverId === popoverId}
                onOpen={setOpenBadgePopoverId}
                onClose={() => setOpenBadgePopoverId(null)}
            />
        );
    });

    const warningFlowLabel =
        pendingFlowWarning === 'update-email'
            ? 'Atualizar email'
            : pendingFlowWarning === 'update-password'
            ? 'Atualizar senha'
            : pendingFlowWarning === 'delete-user'
            ? 'Deletar conta'
            : 'Habilitar dois fatores';

    return (
        <div
            className={`profile-content-shell${
                profileCover ? ' profile-content-shell--with-cover' : ''
            }`}
        >
            {profileCover ? (
                <div className="profile-content-top-cover" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={profileCover}
                        alt=""
                        className="profile-content-top-cover__image"
                    />
                    <div className="profile-content-top-cover__overlay" />
                    <div className="profile-content-top-cover__fade" />
                </div>
            ) : null}

            <div className="profile-content">
                <ProfileHeroSection
                    user={user}
                    profileName={profileName}
                    profileHandle={profileHandle}
                    biography={biography}
                    profileCover={profileCover}
                    accountStatus={accountStatus}
                    accountStatusClass={accountStatusClass}
                    isOwnProfile={isOwnProfile}
                    pictureUploading={pictureUploading}
                    pictureFeedback={pictureFeedback}
                    earnedBadgeKeys={earnedBadgeKeys}
                    openBadgePopoverId={openBadgePopoverId}
                    pictureInputRef={pictureInputRef}
                    onOpenBadgePopover={setOpenBadgePopoverId}
                    onCloseBadgePopover={() => setOpenBadgePopoverId(null)}
                    onPictureClick={handleProfilePictureClick}
                    onSelectImage={(file) =>
                        setPendingImageCrop({ file, intent: 'profile-avatar' })
                    }
                    onOpenProfileControls={handleOpenProfileControls}
                />

                {profileControlModalOpen ? (
                    <ProfileControlModal
                        hasExternalProvider={
                            user.providerId !== null && user.providerId !== undefined
                        }
                        hasActiveTwoFactor={Boolean(user.twoFactorSecret?.active)}
                        hasCover={Boolean(profileCover)}
                        coverActionLoading={coverActionLoading}
                        coverFeedback={coverFeedback}
                        onClose={() => {
                            setCoverFeedback('');
                            setProfileControlModalOpen(false);
                        }}
                        onEditBiography={handleEditBiography}
                        onRequestEmailUpdate={handleRequestEmailUpdate}
                        onRequestPasswordUpdate={handleRequestPasswordUpdate}
                        onRequestToggleTwoFactor={handleRequestToggleTwoFactor}
                        onRequestCoverUpdate={handleCoverAction}
                        onRequestDeleteAccount={() => {
                            setProfileControlModalOpen(false);
                            setPendingFlowWarning('delete-user');
                        }}
                    />
                ) : null}

                <ProfileShowcaseSection
                    title="CAMPANHAS"
                    subtitle={
                        campaigns.length > 0
                            ? `${campaigns.length} campanha(s) encontrada(s)`
                            : 'Nenhuma campanha disponí­vel'
                    }
                    items={campaignItems}
                    label="Campanhas do perfil"
                    variant="campaigns"
                    emptyMessage="Este usuário ainda não possui campanhas visí­veis."
                    cardLayout={true}
                />

                <ProfileShowcaseSection
                    title="FICHAS"
                    subtitle={
                        characters.length > 0
                            ? `${characters.length} personagem(ns) encontrado(s)`
                            : 'Nenhum personagem disponí­vel'
                    }
                    items={characterItems}
                    label="Personagens do perfil"
                    variant="characters"
                    emptyMessage="Este usuário ainda não criou personagens visí­veis."
                    cardLayout={true}
                />

                <ProfileShowcaseSection
                    title="BADGES"
                    subtitle=""
                    items={badgeItems}
                    label="Badges do perfil"
                    variant="badges"
                />

                {selectedCharacterId ? (
                    <CharacterDetailModal
                        characterId={selectedCharacterId}
                        campaignId=""
                        hideInventoryTab={true}
                        onDeleted={() => {
                            const deletedCharacterId = selectedCharacterId;
                            setSelectedCharacterId(null);
                            setCharacters((previous) =>
                                previous.filter(
                                    (character) =>
                                        character.characterId !== deletedCharacterId
                                )
                            );
                        }}
                        onBack={() => setSelectedCharacterId(null)}
                    />
                ) : null}

                {gateStep === 'complete-profile' ? (
                    <CompleteUserModal
                        userId={userId}
                        mode="profile-complete"
                        defaultValues={{
                            firstName: userDetails.firstName ?? '',
                            lastName: userDetails.lastName ?? '',
                            birthday: normalizeBirthdayInput(userDetails.birthday),
                        }}
                        onSuccess={async () => {
                            await refreshProfileUser();
                        }}
                        onCancel={() => router.push('/')}
                    />
                ) : null}

                {pendingFlowWarning ? (
                    <ProfileFlowWarningModal
                        flowLabel={warningFlowLabel}
                        onClose={() => setPendingFlowWarning(null)}
                        onConfirm={() => {
                            if (pendingFlowWarning === 'update-email') {
                                setEmailModalOpen(true);
                            } else if (pendingFlowWarning === 'update-password') {
                                setPasswordModalOpen(true);
                            } else if (pendingFlowWarning === 'delete-user') {
                                setDeleteAccountVerificationModalOpen(true);
                            } else {
                                setManualTwoFactorActivationOpen(true);
                            }

                            setPendingFlowWarning(null);
                        }}
                    />
                ) : null}

                {manualTwoFactorActivationOpen ? (
                    <ProfileTwoFactorActivationModal
                        user={user}
                        onRefreshUser={refreshProfileUser}
                        onCancel={() => {
                            setManualTwoFactorActivationOpen(false);
                        }}
                        onCompleted={() => {
                            setManualTwoFactorActivationOpen(false);
                        }}
                    />
                ) : null}

                {biographyModalOpen ? (
                    <ProfileBiographyModal
                        userId={userId}
                        firstName={userDetails.firstName ?? ''}
                        lastName={userDetails.lastName ?? ''}
                        biography={biography}
                        onClose={() => setBiographyModalOpen(false)}
                        onSaved={async () => {
                            await refreshProfileUser();
                            setBiographyModalOpen(false);
                        }}
                    />
                ) : null}

                {deleteAccountModalOpen ? (
                    <ProfileDeleteAccountModal
                        userId={user.userId}
                        onClose={() => setDeleteAccountModalOpen(false)}
                        onDeleted={() => {
                            setDeleteAccountModalOpen(false);
                            window.location.replace('/');
                        }}
                    />
                ) : null}

                {deleteAccountVerificationModalOpen ? (
                    <ProfileDeleteAccountVerificationModal
                        email={user.email}
                        onClose={() => setDeleteAccountVerificationModalOpen(false)}
                        onVerified={() => {
                            setDeleteAccountVerificationModalOpen(false);
                            setDeleteAccountModalOpen(true);
                        }}
                    />
                ) : null}

                {emailModalOpen ? (
                    <ProfileEmailUpdateModal
                        userId={userId}
                        email={user.email}
                        onClose={() => setEmailModalOpen(false)}
                        onSaved={async () => {
                            await refreshProfileUser();
                            setEmailModalOpen(false);
                        }}
                    />
                ) : null}

                {passwordModalOpen ? (
                    <ProfilePasswordUpdateModal
                        email={user.email}
                        onClose={() => setPasswordModalOpen(false)}
                        onSaved={async () => {
                            setPasswordModalOpen(false);
                        }}
                    />
                ) : null}

                {coverModalOpen ? (
                    <ProfileCoverModal
                        userId={userId}
                        onClose={() => setCoverModalOpen(false)}
                        onSaved={async () => {
                            setCoverFeedback('');
                            await refreshProfileUser();
                            setCoverModalOpen(false);
                        }}
                    />
                ) : null}

                {disableTwoFactorModalOpen ? (
                    <ProfileTwoFactorDisableModal
                        userId={user.userId}
                        email={user.email}
                        onClose={() => setDisableTwoFactorModalOpen(false)}
                        onSaved={async () => {
                            await refreshProfileUser();
                            setDisableTwoFactorModalOpen(false);
                        }}
                    />
                ) : null}

                {pendingImageCrop ? (
                    <ImageCropModal
                        file={pendingImageCrop.file}
                        intent={pendingImageCrop.intent}
                        onConfirm={handleProfilePictureUpload}
                        onUseOriginal={handleProfilePictureUpload}
                        onClose={() => setPendingImageCrop(null)}
                    />
                ) : null}
            </div>
        </div>
    );
}
