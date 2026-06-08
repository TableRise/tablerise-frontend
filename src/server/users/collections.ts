import type { AxiosError, AxiosResponse } from 'axios';
import { apiCall, usersBaseUrl } from '@/server/wrapper';
import type { ImageObject } from '@/types/shared/general';
import type { DatabaseUserWithDetails } from '@/types/shared/entities';

export type UserFriendStatus = 'pending' | 'active';

export interface UserFriendRecord {
    userId: string;
    nickname: string;
    tag?: string;
    picture?: string | null;
    rank?: string | null;
    status: UserFriendStatus;
    favorite?: boolean;
}

export interface UserMessageRecord {
    messageId: string;
    title: string;
    content: string;
    userId: string;
    timestamp: string;
    status?: string;
}

interface SendUserMessagePayload {
    title: string;
    content: string;
    targetUserId: string;
}

function normalizeArrayResponse<T>(data: unknown, keys: string[]): T[] {
    if (Array.isArray(data)) {
        return data as T[];
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const key of keys) {
        if (Array.isArray(record[key])) {
            return record[key] as T[];
        }

        if (
            record.result &&
            typeof record.result === 'object' &&
            Array.isArray((record.result as Record<string, unknown>)[key])
        ) {
            return (record.result as Record<string, unknown>)[key] as T[];
        }
    }

    if (Array.isArray(record.result)) {
        return record.result as T[];
    }

    return [];
}

function normalizeSingleResponse<T>(data: unknown): T | null {
    if (!data || typeof data !== 'object') {
        return null;
    }

    const record = data as Record<string, unknown>;

    if (record.result && typeof record.result === 'object') {
        return {
            ...record.result,
            result: record.result,
        } as T;
    }

    return {
        ...record,
        result: record.result,
    } as T;
}

export async function getUserFriends(userId: string): Promise<UserFriendRecord[]> {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/friends`,
            method: 'GET',
        });

        return normalizeArrayResponse<UserFriendRecord>(data, ['friends']);
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;

        if (status === 404) throw new Error('usuÃ¡rio nao encontrado');
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Nao foi possivel carregar a lista de amigos');
    }
}

export async function searchUserByNickname(
    nickname: string
): Promise<DatabaseUserWithDetails | null> {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: '',
            method: 'GET',
            params: {
                nickname,
            },
        });

        return normalizeSingleResponse<DatabaseUserWithDetails>(data);
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;

        if (status === 404) return null;
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Nao foi possivel procurar aventureiros');
    }
}

export async function removeUserFriend(
    userId: string,
    targetUserId: string
): Promise<void> {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/friends/remove/${targetUserId}`,
            method: 'PATCH',
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;

        if (status === 404) throw new Error('Amizade nao encontrada');
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Nao foi possivel desfazer a amizade');
    }
}

export async function toggleUserFriendFavorite(
    userId: string,
    targetUserId: string
): Promise<void> {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/friends/${targetUserId}/favorite`,
            method: 'PATCH',
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;

        if (status === 404) throw new Error('Amizade nao encontrada');
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Nao foi possivel atualizar o favorito');
    }
}

export async function sendUserFriendRequest(
    userId: string,
    targetUserId: string
): Promise<void> {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/friends/${targetUserId}`,
            method: 'POST',
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;

        if (status === 400) {
            throw new Error('Nao foi possivel enviar esta solicitaÃ§Ã£o de amizade');
        }
        if (status === 403) {
            throw new Error('Voce nao pode enviar uma solicitaÃ§Ã£o para este perfil');
        }
        if (status === 404) throw new Error('usuÃ¡rio nao encontrado');
        if (status === 409) {
            throw new Error('Ja existe uma amizade ou solicitaÃ§Ã£o pendente');
        }
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Nao foi possivel enviar a solicitaÃ§Ã£o de amizade');
    }
}

export async function respondToUserFriendRequest(
    userId: string,
    targetUserId: string,
    decline: boolean
): Promise<void> {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/friends/accept/${targetUserId}`,
            method: 'PATCH',
            params: {
                decline,
            },
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;

        if (status === 400) {
            throw new Error('Nao foi possivel atualizar esta solicitaÃ§Ã£o de amizade');
        }
        if (status === 404) {
            throw new Error('solicitaÃ§Ã£o de amizade nao encontrada');
        }
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Nao foi possivel responder a solicitaÃ§Ã£o de amizade');
    }
}

export async function getUserMessages(userId: string): Promise<UserMessageRecord[]> {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/messages`,
            method: 'GET',
        });

        return normalizeArrayResponse<UserMessageRecord>(data, ['messages']);
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;

        if (status === 404) throw new Error('Mensagens nao encontradas');
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Nao foi possivel carregar as mensagens');
    }
}

export async function sendUserMessage(
    userId: string,
    payload: SendUserMessagePayload
): Promise<void> {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/message`,
            method: 'POST',
            data: payload,
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;

        if (status === 400) throw new Error('Dados invalidos para enviar a mensagem');
        if (status === 403) {
            throw new Error('Voce so pode enviar mensagens para amigos ativos');
        }
        if (status === 404) throw new Error('usuÃ¡rio ou destinatario nao encontrado');
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Nao foi possivel enviar a mensagem');
    }
}

export async function deleteUserMessage(
    userId: string,
    messageId: string
): Promise<void> {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/messages/${messageId}`,
            method: 'DELETE',
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;

        if (status === 404) throw new Error('Mensagem nao encontrada');
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Nao foi possivel remover a mensagem');
    }
}

export async function markUserMessageAsRead(
    userId: string,
    messageId: string
): Promise<void> {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/messages/${messageId}/mark`,
            method: 'PATCH',
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;

        if (status === 404) throw new Error('Mensagem nao encontrada');
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Nao foi possivel marcar a mensagem como lida');
    }
}

export async function getUserGallery(userId: string): Promise<ImageObject[]> {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/gallery`,
            method: 'GET',
        });

        return normalizeArrayResponse<ImageObject>(data, ['gallery', 'images']);
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;

        if (status === 404) throw new Error('Galeria nao encontrada');
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Nao foi possivel carregar a galeria');
    }
}
