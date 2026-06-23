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
import type { ImageObject } from '@/types/shared/general';
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
import ProfileTitleModal from '@/components/profile/ProfileTitleModal';
import ProfileCoverInstructionsModal from '@/components/profile/ProfileCoverInstructionsModal';
import ProfileDeleteAccountModal from '@/components/profile/ProfileDeleteAccountModal';
import ProfileDeleteAccountVerificationModal from '@/components/profile/ProfileDeleteAccountVerificationModal';
import ProfileEmailUpdateModal from '@/components/profile/ProfileEmailUpdateModal';
import ProfileCoverModal from '@/components/profile/ProfileCoverModal';
import ProfileControlModal from '@/components/profile/ProfileControlModal';
import ProfilePasswordUpdateModal from '@/components/profile/ProfilePasswordUpdateModal';
import ProfileFriendCard from '@/components/profile/ProfileFriendCard';
import ProfileFriendsListModal from '@/components/profile/ProfileFriendsListModal';
import ProfileFriendSearchModal from '@/components/profile/ProfileFriendSearchModal';
import ProfileGalleryModal from '@/components/profile/ProfileGalleryModal';
import ProfileMessagesModal from '@/components/profile/ProfileMessagesModal';
import ProfileFriendRequestModal from '@/components/profile/ProfileFriendRequestModal';
import ProfileFriendRequestsInboxModal from '@/components/profile/ProfileFriendRequestsInboxModal';
import {
    badgeEntries,
    badgeMap,
    defaultProfileImage,
    formatAccountStatus,
    formatBadgeName,
    formatCampaignDate,
    getBadgeProgress,
    getProfileTitleResolution,
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
import {
    getUserFriends,
    getUserMessages,
    deleteUserGalleryImage,
    removeUserFriend,
    respondToUserFriendRequest,
    sendUserFriendRequest,
    toggleUserFriendFavorite,
    type UserFriendRecord,
    type UserMessageRecord,
    type UserFriendStatus,
} from '@/server/users/collections';
import { updateUserPicture } from '@/server/users/update-user-picture';
import { removeUserCover } from '@/server/users/update-user-cover';
import type { ImageUploadIntent } from '@/utils/imageCrop';
import { useUserGallery } from '@/hooks/useUserGallery';
import ImageSourceChoiceModal from '@/components/common/ImageSourceChoiceModal';
import UserGalleryPickerModal from '@/components/common/UserGalleryPickerModal';
import type { UploadImageValue } from '@/utils/imageUploadPayload';

type ProfilePageContentProps = {
    userId: string;
};

function buildBadgePopoverId(scope: 'catalog', badgeKey: string): string {
    return `${scope}:${badgeKey}`;
}

function sortFriendRecords(
    records: UserFriendRecord[],
    favoritesFirst = false
): UserFriendRecord[] {
    return [...records].sort((left, right) => {
        if (favoritesFirst) {
            const favoriteDifference =
                Number(right.favorite === true) - Number(left.favorite === true);

            if (favoriteDifference !== 0) return favoriteDifference;
        }

        const nicknameDifference = (left.nickname || '').localeCompare(
            right.nickname || ''
        );

        if (nicknameDifference !== 0) return nicknameDifference;

        return left.userId.localeCompare(right.userId);
    });
}

function isUnreadMessage(message: UserMessageRecord): boolean {
    return message.status === 'not-read';
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
    const [titleModalOpen, setTitleModalOpen] = useState(false);
    const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
    const [deleteAccountVerificationModalOpen, setDeleteAccountVerificationModalOpen] =
        useState(false);
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [coverInstructionsModalOpen, setCoverInstructionsModalOpen] = useState(false);
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
    const [ownerFriendRecords, setOwnerFriendRecords] = useState<UserFriendRecord[]>([]);
    const [ownerMessages, setOwnerMessages] = useState<UserMessageRecord[]>([]);
    const [friendsError, setFriendsError] = useState('');
    const [removingFriendId, setRemovingFriendId] = useState<string | null>(null);
    const [favoriteLoadingFriendId, setFavoriteLoadingFriendId] = useState<string | null>(
        null
    );
    const [friendsListModalOpen, setFriendsListModalOpen] = useState(false);
    const [friendSearchModalOpen, setFriendSearchModalOpen] = useState(false);
    const [messagesModalOpen, setMessagesModalOpen] = useState(false);
    const [galleryModalOpen, setGalleryModalOpen] = useState(false);
    const [friendRequestModalOpen, setFriendRequestModalOpen] = useState(false);
    const [friendRequestsInboxModalOpen, setFriendRequestsInboxModalOpen] =
        useState(false);
    const [viewerFriendStatus, setViewerFriendStatus] = useState<UserFriendStatus | null>(
        null
    );
    const [checkingViewerFriendStatus, setCheckingViewerFriendStatus] = useState(false);
    const [profilePictureChoiceOpen, setProfilePictureChoiceOpen] = useState(false);
    const [profilePictureGalleryOpen, setProfilePictureGalleryOpen] = useState(false);
    const pictureInputRef = useRef<HTMLInputElement>(null);
    const isOwnProfile =
        Boolean(currentUserId) &&
        (currentUserId === userId || currentUserId === (user?.userId ?? '').trim());
    const { galleryImages, loadingGallery, refreshGallery } = useUserGallery(
        isOwnProfile ? currentUserId : undefined
    );

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
    const profileLevel = useMemo(() => {
        const rawLevel = userDetails?.level;
        const normalizedLevel =
            typeof rawLevel === 'number'
                ? rawLevel
                : typeof rawLevel === 'string'
                ? Number(rawLevel)
                : NaN;

        return Number.isFinite(normalizedLevel) ? normalizedLevel : 0;
    }, [userDetails]);
    const profileXp = useMemo(() => {
        const rawXp = userDetails?.xp;
        const normalizedXp =
            typeof rawXp === 'number'
                ? rawXp
                : typeof rawXp === 'string'
                ? Number(rawXp)
                : NaN;

        return Number.isFinite(normalizedXp) ? normalizedXp : 0;
    }, [userDetails]);
    const {
        availableTitles,
        resolvedTitle: resolvedProfileTitle,
        resolvedTitleType: resolvedProfileTitleType,
    } = useMemo(
        () =>
            getProfileTitleResolution(
                profileLevel,
                userDetails?.title,
                userDetails?.gender
            ),
        [profileLevel, userDetails?.title, userDetails?.gender]
    );
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
        if (loadingGallery) {
            setPictureFeedback('Carregando galeria...');
            return;
        }

        if (galleryImages.length > 0) {
            setPictureFeedback('');
            setProfilePictureChoiceOpen(true);
            return;
        }

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

    const handleRequestTitleChange = () => {
        if (availableTitles.length === 0) return;
        setProfileControlModalOpen(false);
        setTitleModalOpen(true);
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
            setCoverInstructionsModalOpen(true);
            return;
        }

        void (async () => {
            setCoverActionLoading(true);

            try {
                await removeUserCover(userId);
                await refreshProfileUser();
                await refreshGallery();
            } catch (error: Error | any) {
                setCoverFeedback(
                    error?.message ??
                        'Não foi possivel remover o plano de fundo do perfil.'
                );
            } finally {
                setCoverActionLoading(false);
            }
        })();
    };

    const handleProfilePictureUpload = async (file: UploadImageValue) => {
        setPictureUploading(true);
        setPictureFeedback('');

        try {
            await updateUserPicture(userId, file);
            await refreshProfileUser();
            await refreshGallery();
            setPendingImageCrop(null);
        } catch (error: Error | any) {
            setPictureFeedback(
                error?.message ?? 'Não foi possivel atualizar a foto do perfil.'
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

    useEffect(() => {
        let mounted = true;

        async function loadFriends() {
            setFriendsError('');

            try {
                const allFriends = await getUserFriends(userId);

                if (!mounted) return;

                setOwnerFriendRecords(allFriends);
            } catch (error: Error | any) {
                if (!mounted) return;

                setOwnerFriendRecords([]);
                setFriendsError(
                    error?.message ?? 'Não foi possivel carregar a lista de amigos.'
                );
            }
        }

        void loadFriends();

        return () => {
            mounted = false;
        };
    }, [userId]);

    useEffect(() => {
        if (!isOwnProfile) {
            setOwnerMessages([]);
            return;
        }

        let mounted = true;

        async function loadMessages() {
            try {
                const inboxMessages = await getUserMessages(userId);

                if (!mounted) return;

                setOwnerMessages(inboxMessages);
            } catch {
                if (!mounted) return;

                setOwnerMessages([]);
            }
        }

        void loadMessages();

        return () => {
            mounted = false;
        };
    }, [isOwnProfile, userId]);

    useEffect(() => {
        if (!currentUserId || isOwnProfile) {
            setViewerFriendStatus(null);
            setCheckingViewerFriendStatus(false);
            return;
        }

        let mounted = true;

        async function loadViewerFriendStatus() {
            setCheckingViewerFriendStatus(true);

            try {
                const viewerFriends = await getUserFriends(currentUserId);

                if (!mounted) return;

                const existingFriend = viewerFriends.find(
                    (friend) => friend.userId === userId
                );

                setViewerFriendStatus(existingFriend?.status ?? null);
            } catch {
                if (!mounted) return;

                setViewerFriendStatus(null);
            } finally {
                if (mounted) {
                    setCheckingViewerFriendStatus(false);
                }
            }
        }

        void loadViewerFriendStatus();

        return () => {
            mounted = false;
        };
    }, [currentUserId, isOwnProfile, userId]);

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
                description="não encontramos este perfil ou ele não está disponível agora."
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
                    Nível {character.level}
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

    const handleRemoveFriend = (targetUserId: string) => {
        void (async () => {
            setRemovingFriendId(targetUserId);
            setFriendsError('');

            try {
                await removeUserFriend(userId, targetUserId);
                setOwnerFriendRecords((previous) =>
                    previous.filter((friendItem) => friendItem.userId !== targetUserId)
                );
            } catch (error: Error | any) {
                setFriendsError(error?.message ?? 'Não foi possivel desfazer a amizade.');
            } finally {
                setRemovingFriendId(null);
            }
        })();
    };

    const handleSendFriendRequest = async () => {
        await sendUserFriendRequest(currentUserId, userId);
        setViewerFriendStatus('pending');
        setFriendRequestModalOpen(false);
    };

    const handleOpenFriendSearch = () => {
        setFriendSearchModalOpen(true);
    };

    const handleCloseFriendsListModal = () => {
        setFriendsListModalOpen(false);
    };

    const handleNavigateToFoundProfile = (targetUserId: string) => {
        setFriendSearchModalOpen(false);
        setFriendRequestsInboxModalOpen(false);
        router.push(`/profile/${targetUserId}`);
    };

    const handleToggleFavoriteFriend = (targetUserId: string) => {
        void (async () => {
            setFavoriteLoadingFriendId(targetUserId);
            setFriendsError('');

            try {
                await toggleUserFriendFavorite(userId, targetUserId);
                const refreshedFriends = await getUserFriends(userId);
                setOwnerFriendRecords(refreshedFriends);
            } catch (error: Error | any) {
                setFriendsError(
                    error?.message ?? 'Não foi possivel atualizar o favorito.'
                );
            } finally {
                setFavoriteLoadingFriendId(null);
            }
        })();
    };

    const handleAcceptFriendRequest = async (targetUserId: string) => {
        await respondToUserFriendRequest(userId, targetUserId, false);
        const refreshedFriends = await getUserFriends(userId);
        setOwnerFriendRecords(refreshedFriends);
    };

    const handleRejectFriendRequest = async (targetUserId: string) => {
        await respondToUserFriendRequest(userId, targetUserId, true);
        const refreshedFriends = await getUserFriends(userId);
        setOwnerFriendRecords(refreshedFriends);
    };

    const handleDeleteGalleryImage = async (image: ImageObject) => {
        if (!image.id?.trim()) {
            throw new Error('Imagem da galeria não encontrada');
        }

        await deleteUserGalleryImage(userId, image.id);
        await refreshGallery();
    };

    const activeFriends = sortFriendRecords(
        ownerFriendRecords.filter((friend) => friend.status === 'active'),
        true
    );
    const pendingFriendRequests = sortFriendRecords(
        ownerFriendRecords.filter((friend) => friend.status === 'pending')
    );
    const unreadMessagesCount = ownerMessages.filter(isUnreadMessage).length;

    const friendItems = activeFriends.map((friend) => (
        <ProfileFriendCard
            key={friend.userId}
            friend={friend}
            currentUserId={currentUserId}
            isRemoving={removingFriendId === friend.userId}
            isFavoriteLoading={favoriteLoadingFriendId === friend.userId}
            canRemoveFriend={isOwnProfile}
            canFavoriteFriend={isOwnProfile}
            onRemoveFriend={handleRemoveFriend}
            onToggleFavorite={handleToggleFavoriteFriend}
        />
    ));
    const friendSubtitle = friendsError
        ? friendsError
        : activeFriends.length > 0
        ? `${activeFriends.length} amigo(s) ativo(s)`
        : 'Nenhum amigo ativo encontrado';
    const canOpenMessages =
        Boolean(currentUserId) &&
        (isOwnProfile ||
            (!checkingViewerFriendStatus && viewerFriendStatus === 'active'));
    const showFriendRequestAction =
        Boolean(currentUserId) &&
        !isOwnProfile &&
        !checkingViewerFriendStatus &&
        viewerFriendStatus === null;

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
                    level={profileLevel}
                    xp={profileXp}
                    activeTitle={resolvedProfileTitle}
                    activeTitleType={resolvedProfileTitleType}
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
                    showMessageAction={canOpenMessages}
                    messageBadgeCount={isOwnProfile ? unreadMessagesCount : 0}
                    onOpenMessages={() => setMessagesModalOpen(true)}
                    showFriendRequestsInboxAction={isOwnProfile}
                    friendRequestsBadgeCount={pendingFriendRequests.length}
                    onOpenFriendRequestsInbox={() =>
                        setFriendRequestsInboxModalOpen(true)
                    }
                    showProfileControlsAction={isOwnProfile}
                    showGalleryAction={isOwnProfile}
                    onOpenGallery={() => setGalleryModalOpen(true)}
                    showFriendRequestAction={showFriendRequestAction}
                    onOpenFriendRequest={() => setFriendRequestModalOpen(true)}
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
                        onRequestTitleChange={handleRequestTitleChange}
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
                    title="LISTA DE AMIZADES"
                    subtitle={friendSubtitle}
                    items={friendItems}
                    label="Amigos do perfil"
                    variant="friends"
                    emptyMessage={
                        isOwnProfile
                            ? 'Sua lista de amigos ainda esta vazia.'
                            : 'Este usuário ainda não possui amigos visíveis.'
                    }
                    headerAction={
                        activeFriends.length > 0 ? (
                            <button
                                type="button"
                                className="font-XS-regular profile-showcase__link"
                                onClick={() => setFriendsListModalOpen(true)}
                            >
                                Ver mais
                            </button>
                        ) : null
                    }
                />

                <ProfileShowcaseSection
                    title="CAMPANHAS"
                    subtitle={
                        campaigns.length > 0
                            ? `${campaigns.length} campanha(s) encontrada(s)`
                            : 'Nenhuma campanha disponível'
                    }
                    items={campaignItems}
                    label="Campanhas do perfil"
                    variant="campaigns"
                    emptyMessage="Este usuário ainda não possui campanhas visíveis."
                    cardLayout={true}
                />

                <ProfileShowcaseSection
                    title="FICHAS"
                    subtitle={
                        characters.length > 0
                            ? `${characters.length} personagem(ns) encontrado(s)`
                            : 'Nenhum personagem disponível'
                    }
                    items={characterItems}
                    label="Personagens do perfil"
                    variant="characters"
                    emptyMessage="Este usuário ainda não criou personagens visíveis."
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
                            gender: userDetails.gender ?? 'male',
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

                {titleModalOpen ? (
                    <ProfileTitleModal
                        userId={userId}
                        gender={userDetails.gender ?? 'male'}
                        availableTitles={availableTitles}
                        selectedTitle={resolvedProfileTitle}
                        onClose={() => setTitleModalOpen(false)}
                        onSaved={async () => {
                            await refreshProfileUser();
                            setTitleModalOpen(false);
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

                {coverInstructionsModalOpen ? (
                    <ProfileCoverInstructionsModal
                        onClose={() => setCoverInstructionsModalOpen(false)}
                        onConfirm={() => {
                            setCoverInstructionsModalOpen(false);
                            setCoverModalOpen(true);
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

                {messagesModalOpen ? (
                    <ProfileMessagesModal
                        mode={isOwnProfile ? 'inbox' : 'compose'}
                        ownerUserId={userId}
                        currentUserId={currentUserId}
                        recipientLabel={profileName || user.nickname || 'este usuário'}
                        onMessagesChange={isOwnProfile ? setOwnerMessages : undefined}
                        onClose={() => setMessagesModalOpen(false)}
                    />
                ) : null}

                {friendRequestModalOpen ? (
                    <ProfileFriendRequestModal
                        recipientLabel={profileName || user.nickname || 'este usuário'}
                        onClose={() => setFriendRequestModalOpen(false)}
                        onConfirm={handleSendFriendRequest}
                    />
                ) : null}

                {friendRequestsInboxModalOpen ? (
                    <ProfileFriendRequestsInboxModal
                        requests={pendingFriendRequests}
                        onClose={() => setFriendRequestsInboxModalOpen(false)}
                        onOpenSearch={handleOpenFriendSearch}
                        onAccept={handleAcceptFriendRequest}
                        onReject={handleRejectFriendRequest}
                    />
                ) : null}

                {galleryModalOpen ? (
                    <ProfileGalleryModal
                        images={galleryImages}
                        onDeleteImage={handleDeleteGalleryImage}
                        onClose={() => setGalleryModalOpen(false)}
                    />
                ) : null}

                {friendsListModalOpen ? (
                    <ProfileFriendsListModal
                        friends={activeFriends}
                        currentUserId={currentUserId}
                        removingFriendId={removingFriendId}
                        favoriteLoadingFriendId={favoriteLoadingFriendId}
                        canRemoveFriend={isOwnProfile}
                        canFavoriteFriend={isOwnProfile}
                        onRemoveFriend={handleRemoveFriend}
                        onToggleFavorite={handleToggleFavoriteFriend}
                        onClose={handleCloseFriendsListModal}
                    />
                ) : null}

                {friendSearchModalOpen ? (
                    <ProfileFriendSearchModal
                        onClose={() => setFriendSearchModalOpen(false)}
                        onSelectUser={handleNavigateToFoundProfile}
                    />
                ) : null}

                {profilePictureChoiceOpen ? (
                    <ImageSourceChoiceModal
                        title="Selecionar foto do perfil"
                        description="Escolha se deseja enviar uma nova imagem ou usar uma que já esta na sua galeria."
                        onClose={() => setProfilePictureChoiceOpen(false)}
                        onSelectLocal={() => {
                            setProfilePictureChoiceOpen(false);
                            pictureInputRef.current?.click();
                        }}
                        onSelectGallery={() => {
                            setProfilePictureChoiceOpen(false);
                            setProfilePictureGalleryOpen(true);
                        }}
                    />
                ) : null}

                {profilePictureGalleryOpen ? (
                    <UserGalleryPickerModal
                        title="Selecionar foto do perfil"
                        description="Escolha uma imagem da sua galeria para usar como avatar."
                        images={galleryImages}
                        onClose={() => setProfilePictureGalleryOpen(false)}
                        onSelect={(image) => {
                            setProfilePictureGalleryOpen(false);
                            void handleProfilePictureUpload(image).catch(() => undefined);
                        }}
                    />
                ) : null}

                {pendingImageCrop ? (
                    <ImageCropModal
                        file={pendingImageCrop.file}
                        intent={pendingImageCrop.intent}
                        onConfirm={handleProfilePictureUpload}
                        onClose={() => setPendingImageCrop(null)}
                    />
                ) : null}
            </div>
        </div>
    );
}
