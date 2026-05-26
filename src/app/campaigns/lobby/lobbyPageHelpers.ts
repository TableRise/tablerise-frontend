import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import type { ImageObject } from '@/types/shared/general';
import type { DatabaseCampaignBuyRecord } from '@/types/shared/entities';
import type { SocketPlayer, SocketPresenceUser } from '@/types/shared/socket';

export interface CampaignData {
    campaignId: string;
    code: string;
    title: string;
    cover: { link: string };
    description: string;
    mainHistory: string;
    system: string;
    campaignPlayers: SocketPlayer[];
    nextMatchDate: string;
    socialMedia: { discord?: string; twitter?: string; youtube?: string };
    confirmedPlayers: SocketPresenceUser[];
    visibility: string;
    ageRestriction: string;
    nextSessionResume: string;
    playerAmountLimit: number;
    xpSystem: boolean;
    shopSystem: boolean;
    mapImages: ImageObject[];
    logs: { loggedAt: string; content: string }[];
    musics: CampaignMusic[];
    buys: DatabaseCampaignBuyRecord[];
}

export interface ConfirmedPlayerInfo {
    userId: string;
    name: string;
    picture: string;
    rank?: string;
}

export const CATEGORY_LABEL: Record<string, string> = {
    all: 'Todos',
    master: 'Mestre',
    admin: 'Admin',
    players: 'Jogadores',
    'characters-players': 'Personagens (Jogadores)',
    'characters-master': 'Personagens (Mestre)',
    environment: 'Ambiente',
    'world-news': 'NotÃ­cias do Mundo',
    announcements: 'Anuncios',
};

function normalizeConfirmedPlayers(
    entries: Array<string | { userId: string; role?: string }> | undefined
): SocketPresenceUser[] {
    return (entries ?? [])
        .map((entry) => {
            if (typeof entry === 'string') {
                return { userId: entry };
            }

            return {
                userId: entry.userId,
                role: entry.role as SocketPresenceUser['role'],
            };
        })
        .filter((entry) => Boolean(entry.userId));
}

export function mapCampaignData(data: any): CampaignData {
    const campaignPlayers = (data.campaignPlayers ?? []) as SocketPlayer[];
    const activeCampaignUserIds = new Set(
        campaignPlayers.map((player) => player.userId).filter(Boolean)
    );

    return {
        campaignId: data.campaignId,
        code: data.code ?? '',
        title: data.title,
        cover: { link: data.cover?.link },
        description: data.description,
        mainHistory: data.mainHistory ?? '',
        system: data.system,
        campaignPlayers,
        nextMatchDate: data.infos?.nextMatchDate ?? '',
        socialMedia: data.infos?.socialMedia ?? {},
        confirmedPlayers: normalizeConfirmedPlayers(
            data.matchData?.confirmedPlayers
        ).filter((entry) => activeCampaignUserIds.has(entry.userId)),
        mapImages: data.matchData?.mapImages ?? [],
        logs: data.matchData?.logs ?? [],
        musics: data.musics ?? [],
        buys: Array.isArray(data.buys) ? data.buys : [],
        visibility: data.visibility ?? '',
        ageRestriction: data.ageRestriction ?? '',
        nextSessionResume: data.matchData?.nextSessionResume ?? '',
        playerAmountLimit: data.infos?.playerAmountLimit ?? 1,
        xpSystem: data.configurations?.xpSystem ?? true,
        shopSystem:
            data.configurations?.shopOn ?? data.configurations?.shopSystem ?? false,
    };
}
