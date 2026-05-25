import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import type { JournalPost } from '@/server/campaigns/get-journal-posts';
import type { ImageObject } from '@/types/shared/general';

export type SocketPlayerRole = 'admin_player' | 'dungeon_master' | 'player';
export type SocketPlayerStatus = 'pending' | 'active' | 'inactive' | 'banned';
export type MatchEffect = 'dark' | 'light' | 'rain' | null;

export interface SocketAckError {
    code: string;
    message: string;
}

export type SocketAck<T = any> =
    | {
          ok: true;
          data?: T;
      }
    | {
          ok: false;
          error: SocketAckError;
      };

export interface SocketPlayer {
    userId: string;
    characterIds: string[];
    role: SocketPlayerRole;
    status: SocketPlayerStatus;
}

export interface SocketPresenceUser {
    userId: string;
    role?: SocketPlayerRole;
}

export type SocketJournal = JournalPost;
export type SocketMusic = CampaignMusic;
export type SocketImageObject = ImageObject;

export interface MatchToken {
    tokenId: string;
    characterId: string;
    isClone: boolean;
    xPct: number;
    yPct: number;
    widthPct: number;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CampaignSyncPayload {
    campaignId: string;
    serverTime: string;
    presence: {
        connectedUsers: SocketPresenceUser[];
        confirmedPlayers: SocketPresenceUser[];
    };
    match: {
        activeMap: string | null;
        gridVisible: boolean;
        activeEffect: MatchEffect;
        playingMusicId: string | null;
        visibleCharacterIds: string[];
        images: ImageObject[];
        imageHighlighted: ImageObject | null;
        tokens: MatchToken[];
        highlightedJournalPost: SocketJournal | null;
    };
}

export interface PresenceUserChangedPayload {
    campaignId: string;
    userId: string;
    role: SocketPlayerRole;
}

export interface ConfirmedPlayersUpdatedPayload {
    campaignId: string;
    confirmedPlayers: SocketPresenceUser[];
}

export interface MatchMapChangedPayload {
    campaignId: string;
    activeMap: string | null;
}

export interface MatchGridChangedPayload {
    campaignId: string;
    gridVisible: boolean;
}

export interface MatchEffectChangedPayload {
    campaignId: string;
    activeEffect: MatchEffect;
}

export interface MatchMusicChangedPayload {
    campaignId: string;
    playingMusicId: string | null;
}

export interface VisibleCharactersChangedPayload {
    campaignId: string;
    visibleCharacterIds: string[];
}

export interface TokenBatchUpdatedPayload {
    campaignId: string;
    updates: MatchToken[];
}

export interface TokenDeletedPayload {
    campaignId: string;
    tokenId: string;
}

export interface TokenWrappedPayload {
    campaignId: string;
    token: MatchToken;
}

export interface TokenBatchWrappedPayload {
    campaignId: string;
    tokens: MatchToken[];
}

export interface DiceRollResolvedPayload {
    rollId: string;
    campaignId: string;
    userId: string;
    characterId: string | null;
    notation: string;
    label: string;
    rolls: number[];
    total: number;
    visibility: 'room';
}

export interface JournalHighlightChangedPayload {
    campaignId: string;
    highlightedJournalPost?: SocketJournal | null;
}

export interface JournalPostCreatedPayload {
    campaignId: string;
    post: SocketJournal;
}

export interface CharacterUpdatedPayload {
    characterId: string;
    campaignId: string;
    updatedFields: string[];
    summary: {
        currentHitPoints: number | null;
        level: number | null;
    };
    updatedAt: string;
}

export interface CampaignPlayerJoinedPayload {
    campaignId: string;
    player: SocketPlayer;
}

export interface CampaignPlayerLeftPayload {
    campaignId: string;
    userId: string;
    player: SocketPlayer | null;
}

export interface DungeonMasterTransferredPayload {
    campaignId: string;
    previousDungeonMasterId: string;
    newDungeonMasterId: string;
}

export interface CampaignMapsUpdatedPayload {
    campaignId: string;
    mapImages: SocketImageObject[];
}

export interface CampaignImagesUpdatedPayload {
    campaignId: string;
    images: SocketImageObject[];
}

export interface CampaignMusicsUpdatedPayload {
    campaignId: string;
    musics: SocketMusic[];
}

export interface MatchImageHighlightedChangedPayload {
    campaignId: string;
    imageHighlighted: SocketImageObject | null;
}

export interface CampaignSettingsUpdatedPayload {
    campaignId: string;
    title?: string;
    description?: string;
    visibility?: string;
    ageRestriction?: string;
    nextMatchDate?: string | null;
    nextSessionResume?: string | null;
    playerAmountLimit?: number;
    socialMedia?: {
        discord?: string;
        twitter?: string;
        youtube?: string;
    };
}
