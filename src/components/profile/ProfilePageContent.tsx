'use client';

import { KeyboardEvent, useContext, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import badgesCatalog from '@assets/badges.js';
import { getUser } from '@/server/users/get-user';
import { getCampaignsByUserId } from '@/server/campaigns/get-campaigns';
import formatDate from '@/utils/formatDate';
import {
    getCharacterById,
    type FullCharacterDnd,
} from '@/server/characters/get-characters';
import type {
    DatabaseCampaign,
    DatabaseCampaignGroupsResponse,
    DatabaseUserDetail,
    DatabaseUserWithDetails,
} from '@/types/shared/entities';
import TableriseContext from '@/context/TableriseContext';
import CharacterDetailModal from '@/components/lobby/CharacterDetailModal';
import ProfileCarousel from '@/components/profile/ProfileCarousel';

type ProfilePageContentProps = {
    userId: string;
};

type BadgeVariant = {
    colorful: string;
    blackandwhite: string;
};

type ProfileCampaign = {
    campaignId: string;
    title: string;
    description: string;
    cover: string;
    system?: string;
    ageRestriction?: string;
    nextMatchDate?: string;
    playerAmountLimit?: number;
    playerCount: number;
};

type ProfileCharacter = {
    characterId: string;
    name: string;
    race: string;
    className: string;
    level: number;
    picture: string;
};

const badgeMap = badgesCatalog as Record<string, BadgeVariant>;
const badgeEntries = Object.entries(badgeMap);
const defaultProfileImage = '/images/SideImageBackground.svg';

type StoredUser = {
    userId?: string;
};

function normalizeUserDetails(
    user: DatabaseUserWithDetails | null
): DatabaseUserDetail | null {
    return user?.details ?? user?.result?.details ?? null;
}

function formatBirthday(dateString?: string): string {
    if (!dateString) return 'Não informado';

    const normalizedDate = dateString.includes('T')
        ? dateString
        : `${dateString}T00:00:00`;
    const parsedDate = new Date(normalizedDate);

    if (Number.isNaN(parsedDate.getTime())) return 'Não informado';

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(parsedDate);
}

function formatAccountStatus(status?: string): string {
    if (status === 'done') return 'Ativa';
    return 'Pendente';
}

function formatBadgeName(key: string): string {
    return key
        .replace(/^badge_/g, '')
        .split('_')
        .map((part) => {
            if (/^\d+$/.test(part)) return part;
            if (part === 'campaigns') return 'campanhas';
            return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join(' ');
}

function formatCampaignDate(dateString?: string): string {
    if (!dateString || dateString === 'no-date' || dateString === 'undefined') {
        return 'Em aberto';
    }

    const formattedDate = formatDate(dateString);

    return formattedDate || 'Em aberto';
}

function mapCampaign(campaign: DatabaseCampaign): ProfileCampaign {
    const playerCount = (campaign.campaignPlayers ?? []).filter(
        (player) => player.role === 'player' || player.role === 'admin_player'
    ).length;

    return {
        campaignId: campaign.campaignId ?? '',
        title: campaign.title,
        description: campaign.description,
        cover: campaign.cover?.link ?? defaultProfileImage,
        system: campaign.system,
        ageRestriction: campaign.ageRestriction,
        nextMatchDate: campaign.infos?.nextMatchDate,
        playerAmountLimit: campaign.infos?.playerAmountLimit,
        playerCount,
    };
}

function mergeCampaigns(
    campaignGroups?: DatabaseCampaignGroupsResponse
): ProfileCampaign[] {
    const campaignMap = new Map<string, ProfileCampaign>();

    [...(campaignGroups?.master ?? []), ...(campaignGroups?.player ?? [])].forEach(
        (campaign) => {
            const mappedCampaign = mapCampaign(campaign);

            if (!mappedCampaign.campaignId) return;
            if (campaignMap.has(mappedCampaign.campaignId)) return;

            campaignMap.set(mappedCampaign.campaignId, mappedCampaign);
        }
    );

    return Array.from(campaignMap.values());
}

function mapCharacter(character: FullCharacterDnd): ProfileCharacter {
    return {
        characterId: character.characterId,
        name: character.data.profile.name,
        race: character.data.profile.race,
        className: character.data.profile.class,
        level: character.data.profile.level,
        picture:
            character.data.profile.characteristics?.appearance?.picture?.link ??
            character.data.profile.picture?.link ??
            character.picture?.link ??
            defaultProfileImage,
    };
}

function handleCardKeyDown(event: KeyboardEvent<HTMLElement>, handler: () => void): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handler();
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

    useEffect(() => {
        try {
            const storedUserRaw = localStorage.getItem('userLogged');
            const storedUser = storedUserRaw
                ? (JSON.parse(storedUserRaw) as StoredUser | null)
                : null;
            setCurrentUserId(storedUser?.userId ?? '');
        } catch {
            setCurrentUserId('');
        }
    }, []);

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
                    setFetchError('Não foi possível carregar este perfil no momento.');
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

    if (loading) {
        return (
            <section className="profile-state-card">
                <h1 className="font-XL-bold profile-state-title">Carregando perfil...</h1>
                <p className="font-S-regular text-color-greyScale/700">
                    Estamos buscando as informações deste aventureiro.
                </p>
            </section>
        );
    }

    if (fetchError) {
        return (
            <section className="profile-state-card">
                <h1 className="font-XL-bold profile-state-title">
                    Erro ao carregar perfil
                </h1>
                <p className="font-S-regular text-color-greyScale/700">{fetchError}</p>
            </section>
        );
    }

    if (!user || !userDetails) {
        return (
            <section className="profile-state-card">
                <h1 className="font-XL-bold profile-state-title">
                    Perfil não encontrado
                </h1>
                <p className="font-S-regular text-color-greyScale/700">
                    Não encontramos este perfil ou ele não está disponível agora.
                </p>
            </section>
        );
    }

    const profileName = `${userDetails.firstName ?? ''} ${
        userDetails.lastName ?? ''
    }`.trim();
    const profileHandle = `${user.nickname ?? ''}${user.tag ?? ''}`;
    const biography = userDetails.biography?.trim();
    const isOwnProfile = Boolean(currentUserId) && currentUserId === userId;
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
                {campaign.ageRestriction && (
                    <span className="profile-campaign-card__age font-XXS-bold">
                        {campaign.ageRestriction}
                    </span>
                )}
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
        const badgeSource = earned ? badgeVariant.colorful : badgeVariant.blackandwhite;

        return (
            <article key={badgeKey} className="profile-badge-card">
                <div className="profile-badge-card__image">
                    <Image
                        src={badgeSource}
                        alt={formatBadgeName(badgeKey)}
                        fill
                        sizes="(max-width: 768px) 10rem, 11rem"
                        style={{ objectFit: 'contain' }}
                    />
                </div>
                <span className="font-XXS-bold profile-badge-card__label">
                    {formatBadgeName(badgeKey)}
                </span>
            </article>
        );
    });

    return (
        <div className="profile-content">
            <section className="profile-hero">
                <div className="profile-hero__cover" />
                <div className="profile-hero__panel">
                    <div className="profile-hero__avatar">
                        <Image
                            src={user.picture?.link ?? defaultProfileImage}
                            alt={profileName || user.nickname}
                            fill
                            sizes="(max-width: 768px) 10rem, 12rem"
                            style={{ objectFit: 'cover' }}
                        />
                    </div>

                    <div className="profile-hero__copy">
                        <div className="profile-hero__identity">
                            <h1 className="font-L-bold profile-hero__name">
                                {profileName || 'Aventureiro sem nome'}
                            </h1>
                            <p className="font-S-bold profile-hero__handle">
                                {profileHandle || 'Sem nickname'}
                            </p>
                            <p className="font-XS-regular">
                                <strong>Status da conta:</strong>{' '}
                                <span className={accountStatusClass}>
                                    {accountStatus}
                                </span>
                            </p>
                            <p className="font-S-regular text-color-greyScale/700">
                                {biography ||
                                    'Este aventureiro ainda não adicionou uma biografia.'}
                            </p>
                        </div>

                        {earnedBadgeKeys.length > 0 ? (
                            <div
                                className="profile-hero__badges"
                                aria-label="Badges ativas"
                            >
                                {earnedBadgeKeys.map((badgeKey) => (
                                    <div key={badgeKey} className="profile-hero__badge">
                                        <Image
                                            src={badgeMap[badgeKey].colorful}
                                            alt={formatBadgeName(badgeKey)}
                                            fill
                                            sizes="4.5rem"
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="font-XXS-regular profile-hero__empty-badges">
                                Este usuário ainda não possui badges ativas.
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <section className="profile-showcase profile-showcase--cards">
                <div className="profile-showcase__header">
                    <h2 className="font-L-bold text-color-greyScale/50">CAMPANHAS</h2>
                    <p className="font-XS-regular text-color-greyScale/200">
                        {campaigns.length > 0
                            ? `${campaigns.length} campanha(s) encontrada(s)`
                            : 'Nenhuma campanha disponível'}
                    </p>
                </div>

                {campaignItems.length > 0 ? (
                    <ProfileCarousel
                        items={campaignItems}
                        label="Campanhas do perfil"
                        variant="campaigns"
                    />
                ) : (
                    <div className="profile-empty-state">
                        <p className="font-S-regular text-color-greyScale/200">
                            Este usuário ainda não possui campanhas visíveis.
                        </p>
                    </div>
                )}
            </section>

            <section className="profile-showcase profile-showcase--cards">
                <div className="profile-showcase__header">
                    <h2 className="font-L-bold text-color-greyScale/50">
                        PERSONAGENS CRIADOS
                    </h2>
                    <p className="font-XS-regular text-color-greyScale/200">
                        {characters.length > 0
                            ? `${characters.length} personagem(ns) encontrado(s)`
                            : 'Nenhum personagem disponível'}
                    </p>
                </div>

                {characterItems.length > 0 ? (
                    <ProfileCarousel
                        items={characterItems}
                        label="Personagens do perfil"
                        variant="characters"
                    />
                ) : (
                    <div className="profile-empty-state">
                        <p className="font-S-regular text-color-greyScale/200">
                            Este usuário ainda não criou personagens visíveis.
                        </p>
                    </div>
                )}
            </section>

            <section className="profile-showcase">
                <div className="profile-showcase__header">
                    <h2 className="font-L-bold text-color-greyScale/50">BADGES</h2>
                    <p className="font-XS-regular text-color-greyScale/200">
                        Coloridas para badges conquistadas, cinza para as restantes.
                    </p>
                </div>

                <ProfileCarousel
                    items={badgeItems}
                    label="Badges do perfil"
                    variant="badges"
                />
            </section>

            {selectedCharacterId && (
                <CharacterDetailModal
                    characterId={selectedCharacterId}
                    campaignId=""
                    hideInventoryTab={true}
                    onBack={() => setSelectedCharacterId(null)}
                />
            )}
        </div>
    );
}
