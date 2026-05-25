import { io, type Socket } from 'socket.io-client';
import type {
    CampaignImagesUpdatedPayload,
    CampaignMapsUpdatedPayload,
    CampaignMusicsUpdatedPayload,
    CampaignPlayerJoinedPayload,
    CampaignPlayerLeftPayload,
    CampaignSettingsUpdatedPayload,
    CampaignSyncPayload,
    CharacterUpdatedPayload,
    ConfirmedPlayersUpdatedPayload,
    DiceRollResolvedPayload,
    DungeonMasterTransferredPayload,
    JournalHighlightChangedPayload,
    JournalPostCreatedPayload,
    MatchEffect,
    MatchEffectChangedPayload,
    MatchGridChangedPayload,
    MatchImageHighlightedChangedPayload,
    MatchMapChangedPayload,
    MatchMusicChangedPayload,
    MatchToken,
    PresenceUserChangedPayload,
    SocketAck,
    SocketAckError,
    TokenBatchUpdatedPayload,
    TokenBatchWrappedPayload,
    TokenDeletedPayload,
    TokenWrappedPayload,
    VisibleCharactersChangedPayload,
} from '@/types/shared/socket';

interface ClientToServerEvents {
    'campaign:join': (
        payload: { campaignId: string },
        ack: (response: SocketAck<void>) => void
    ) => void;
    'match:set_map': (
        payload: { campaignId: string; mapId: string | null },
        ack: (response: SocketAck<void>) => void
    ) => void;
    'match:set_grid': (
        payload: { campaignId: string; gridVisible: boolean },
        ack: (response: SocketAck<void>) => void
    ) => void;
    'match:set_effect': (
        payload: { campaignId: string; activeEffect: MatchEffect },
        ack: (response: SocketAck<void>) => void
    ) => void;
    'match:set_music': (
        payload: { campaignId: string; playingMusicId: string | null },
        ack: (response: SocketAck<void>) => void
    ) => void;
    'match:set_visible_characters': (
        payload: { campaignId: string; visibleCharacterIds: string[] },
        ack: (response: SocketAck<void>) => void
    ) => void;
    'token:create_clone': (
        payload: {
            campaignId: string;
            characterId: string;
            xPct: number;
            yPct: number;
            widthPct: number;
        },
        ack: (response: SocketAck<void>) => void
    ) => void;
    'token:update': (
        payload: {
            campaignId: string;
            tokenId: string;
            characterId?: string;
            isClone?: boolean;
            xPct: number;
            yPct: number;
            widthPct: number;
        },
        ack: (response: SocketAck<void>) => void
    ) => void;
    'token:batch_update': (
        payload: {
            campaignId: string;
            updates: Array<{
                tokenId: string;
                characterId?: string;
                isClone?: boolean;
                xPct: number;
                yPct: number;
                widthPct: number;
            }>;
        },
        ack: (response: SocketAck<void>) => void
    ) => void;
    'token:delete': (
        payload: { campaignId: string; tokenId: string },
        ack: (response: SocketAck<void>) => void
    ) => void;
    'dice:roll_requested': (
        payload: {
            campaignId: string;
            characterId: string | null;
            notation: string;
            label: string;
            visibility: 'room';
        },
        ack: (response: SocketAck<void>) => void
    ) => void;
}

interface ServerToClientEvents {
    'campaign:sync': (payload: CampaignSyncPayload) => void;
    'campaign:error': (payload: SocketAckError) => void;
    'presence:user_joined': (payload: PresenceUserChangedPayload) => void;
    'presence:user_left': (payload: PresenceUserChangedPayload) => void;
    'presence:confirmed_players_updated': (
        payload: ConfirmedPlayersUpdatedPayload
    ) => void;
    'match:map_changed': (payload: MatchMapChangedPayload) => void;
    'match:grid_changed': (payload: MatchGridChangedPayload) => void;
    'match:effect_changed': (payload: MatchEffectChangedPayload) => void;
    'match:music_changed': (payload: MatchMusicChangedPayload) => void;
    'match:visible_characters_changed': (
        payload: VisibleCharactersChangedPayload
    ) => void;
    'token:clone_created': (payload: MatchToken | TokenWrappedPayload) => void;
    'token:updated': (payload: MatchToken | TokenWrappedPayload) => void;
    'token:batch_updated': (
        payload: TokenBatchUpdatedPayload | TokenBatchWrappedPayload
    ) => void;
    'token:deleted': (payload: TokenDeletedPayload) => void;
    'dice:roll_resolved': (payload: DiceRollResolvedPayload) => void;
    'journal:highlight_changed': (payload: JournalHighlightChangedPayload) => void;
    'journal:post_created': (payload: JournalPostCreatedPayload) => void;
    'character:updated': (payload: CharacterUpdatedPayload) => void;
    'campaign:player_joined': (payload: CampaignPlayerJoinedPayload) => void;
    'campaign:player_left': (payload: CampaignPlayerLeftPayload) => void;
    'campaign:dungeon_master_transferred': (
        payload: DungeonMasterTransferredPayload
    ) => void;
    'campaign:maps_updated': (payload: CampaignMapsUpdatedPayload) => void;
    'campaign:images_updated': (payload: CampaignImagesUpdatedPayload) => void;
    'campaign:musics_updated': (payload: CampaignMusicsUpdatedPayload) => void;
    'match:image_highlighted_changed': (
        payload: MatchImageHighlightedChangedPayload
    ) => void;
    'campaign:settings_updated': (payload: CampaignSettingsUpdatedPayload) => void;
}

export type CampaignSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
export type CampaignSocketClientEvent = keyof ClientToServerEvents;

let campaignSocket: CampaignSocket | null = null;

function trimTrailingSlash(value: string): string {
    return value.replace(/\/+$/, '');
}

function getCampaignSocketUrl(): string {
    const configuredCampaignsUrl = process.env.NEXT_PUBLIC_API_CAMPAIGNS?.trim();
    const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

    if (configuredCampaignsUrl) {
        return trimTrailingSlash(configuredCampaignsUrl);
    }

    if (configuredBaseUrl) {
        return `${trimTrailingSlash(configuredBaseUrl)}/campaigns`;
    }

    if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost') {
            return 'http://localhost:3001/campaigns';
        }

        return `${window.location.origin}/campaigns`;
    }

    throw new Error('Socket.IO URL is unavailable outside the browser.');
}

export function getCampaignSocket(): CampaignSocket {
    if (typeof window === 'undefined') {
        throw new Error('Socket.IO connection can only be created in the browser.');
    }

    if (!campaignSocket) {
        campaignSocket = io(getCampaignSocketUrl(), {
            withCredentials: true,
            transports: ['polling', 'websocket'],
            upgrade: true,
        });
    }

    return campaignSocket;
}

export function disconnectCampaignSocket(): void {
    if (!campaignSocket) return;

    campaignSocket.disconnect();
    campaignSocket = null;
}

export function emitCampaignSocketAck(
    socket: CampaignSocket,
    event: 'campaign:join',
    payload: Parameters<ClientToServerEvents['campaign:join']>[0]
): Promise<SocketAck<void>>;
export function emitCampaignSocketAck(
    socket: CampaignSocket,
    event: 'match:set_map',
    payload: Parameters<ClientToServerEvents['match:set_map']>[0]
): Promise<SocketAck<void>>;
export function emitCampaignSocketAck(
    socket: CampaignSocket,
    event: 'match:set_grid',
    payload: Parameters<ClientToServerEvents['match:set_grid']>[0]
): Promise<SocketAck<void>>;
export function emitCampaignSocketAck(
    socket: CampaignSocket,
    event: 'match:set_effect',
    payload: Parameters<ClientToServerEvents['match:set_effect']>[0]
): Promise<SocketAck<void>>;
export function emitCampaignSocketAck(
    socket: CampaignSocket,
    event: 'match:set_music',
    payload: Parameters<ClientToServerEvents['match:set_music']>[0]
): Promise<SocketAck<void>>;
export function emitCampaignSocketAck(
    socket: CampaignSocket,
    event: 'match:set_visible_characters',
    payload: Parameters<ClientToServerEvents['match:set_visible_characters']>[0]
): Promise<SocketAck<void>>;
export function emitCampaignSocketAck(
    socket: CampaignSocket,
    event: 'token:create_clone',
    payload: Parameters<ClientToServerEvents['token:create_clone']>[0]
): Promise<SocketAck<void>>;
export function emitCampaignSocketAck(
    socket: CampaignSocket,
    event: 'token:update',
    payload: Parameters<ClientToServerEvents['token:update']>[0]
): Promise<SocketAck<void>>;
export function emitCampaignSocketAck(
    socket: CampaignSocket,
    event: 'token:batch_update',
    payload: Parameters<ClientToServerEvents['token:batch_update']>[0]
): Promise<SocketAck<void>>;
export function emitCampaignSocketAck(
    socket: CampaignSocket,
    event: 'token:delete',
    payload: Parameters<ClientToServerEvents['token:delete']>[0]
): Promise<SocketAck<void>>;
export function emitCampaignSocketAck(
    socket: CampaignSocket,
    event: 'dice:roll_requested',
    payload: Parameters<ClientToServerEvents['dice:roll_requested']>[0]
): Promise<SocketAck<void>>;
export function emitCampaignSocketAck(
    socket: CampaignSocket,
    event: CampaignSocketClientEvent,
    payload: any
): Promise<SocketAck<void>> {
    return new Promise((resolve) => {
        socket.emit(
            event,
            payload as never,
            ((ack: SocketAck<void>) => resolve(ack)) as never
        );
    });
}
