import { type KeyboardEvent } from 'react';
import badgesCatalog from '@assets/badges.js';
import type {
    DatabaseCampaign,
    DatabaseCampaignGroupsResponse,
    DatabaseUserDetail,
    DatabaseUserWithDetails,
} from '@/types/shared/entities';
import type { FullCharacterDnd } from '@/server/characters/get-characters';
import formatDate from '@/utils/formatDate';

export type BadgeVariant = {
    colorful: string;
    blackandwhite: string;
    description: string;
    progress?: BadgeProgressRule;
};

export type BadgeProgressCounterKey =
    | 'campaignsJoinedAmount'
    | 'campaignsCreatedAmount'
    | 'campaignsClosedAmount'
    | 'equipBoughtAmount'
    | 'donateAmount';

export type BadgeProgressRule = {
    counter: BadgeProgressCounterKey;
    target: number;
    label: string;
};

export type BadgeProgressSnapshot = Partial<
    Record<BadgeProgressCounterKey, number | null | undefined>
>;

export type BadgeProgressModel = {
    hasAutomaticRule: boolean;
    current: number;
    target: number;
    percent: number;
    statusLabel: string;
    progressLabel: string;
};

export type ProfileCampaign = {
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

export type ProfileCharacter = {
    characterId: string;
    name: string;
    race: string;
    className: string;
    level: number;
    picture: string;
};

export type StoredUser = {
    userId?: string;
    result?: {
        userId?: string;
    };
    user?: {
        userId?: string;
    };
};

export type ProfileGateStep = 'none' | 'complete-profile';

export type PendingProfileFlowWarning =
    | 'update-email'
    | 'update-password'
    | 'enable-two-factor'
    | 'delete-user';

export const badgeMap = badgesCatalog as Record<string, BadgeVariant>;
export const badgeEntries = Object.entries(badgeMap);
export const defaultProfileImage = '/images/SideImageBackground.svg';

export function normalizeUserDetails(
    user: DatabaseUserWithDetails | null
): DatabaseUserDetail | null {
    return user?.details ?? user?.result?.details ?? null;
}

export function formatBirthday(dateString?: string): string {
    if (!dateString) return 'não informado';

    const normalizedDate = dateString.includes('T')
        ? dateString
        : `${dateString}T00:00:00`;
    const parsedDate = new Date(normalizedDate);

    if (Number.isNaN(parsedDate.getTime())) return 'não informado';

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(parsedDate);
}

export function normalizeBirthdayInput(dateString?: string): string {
    if (!dateString) return '';
    return dateString.includes('T') ? dateString.split('T')[0] : dateString;
}

export function formatAccountStatus(status?: string): string {
    if (status === 'done') return 'Ativa';
    return 'Pendente';
}

export function formatBadgeName(key: string): string {
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

export function getBadgeProgress(
    badgeKey: string,
    gameInfo?: BadgeProgressSnapshot | null
): BadgeProgressModel {
    const badge = badgeMap[badgeKey];
    const progressRule = badge?.progress;

    if (!progressRule) {
        return {
            hasAutomaticRule: false,
            current: 0,
            target: 1,
            percent: 0,
            statusLabel: 'Sem progresso automatico no momento',
            progressLabel: '0 / 1 progresso automatico',
        };
    }

    const rawCurrent = gameInfo?.[progressRule.counter];
    const current =
        typeof rawCurrent === 'number' && Number.isFinite(rawCurrent) && rawCurrent > 0
            ? rawCurrent
            : 0;
    const target = progressRule.target;
    const percent = Math.min((current / target) * 100, 100);
    const earned = current >= target;

    return {
        hasAutomaticRule: true,
        current,
        target,
        percent,
        statusLabel: earned ? 'Conquistada' : 'Em progresso',
        progressLabel: `${current} / ${target} ${progressRule.label}`,
    };
}

export function formatCampaignDate(dateString?: string): string {
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

export function mergeCampaigns(
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

export function mapCharacter(character: FullCharacterDnd): ProfileCharacter {
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

export function handleCardKeyDown(
    event: KeyboardEvent<HTMLElement>,
    handler: () => void
): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handler();
}

export function normalizeStoredUserId(storedUser: StoredUser | null): string {
    const rawUserId =
        storedUser?.userId ?? storedUser?.result?.userId ?? storedUser?.user?.userId;

    return typeof rawUserId === 'string' ? rawUserId.trim() : '';
}
