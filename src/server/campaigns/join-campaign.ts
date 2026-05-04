import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, campaignsBaseUrl } from '../wrapper';

export const getCampaignById = async (campaignId: string) => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: campaignId,
            method: 'GET',
        });

        return data;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) return null;
        if (status === 500) throw new Error('Erro no servidor');
        return null;
    }
};

export const addPlayerToCampaign = async (campaignId: string, password?: string) => {
    try {
        const params: { password?: string } = {};
        if (password) params.password = password;

        const { data }: AxiosResponse = await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/update/player/add`,
            method: 'POST',
            params,
        });

        return data;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 401) throw new Error('Senha incorreta');
        if (status === 404) throw new Error('Campanha não encontrada');
        if (status === 409) throw new Error('Você já está nesta campanha');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao entrar na campanha');
    }
};

export const confirmPlayerPresence = async (campaignId: string, cancel?: boolean) => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/update/match/player-presence`,
            method: 'POST',
            ...(cancel ? { params: { cancel: true } } : {}),
        });

        return data;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) throw new Error('Campanha não encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao confirmar presença');
    }
};

export const leaveCampaign = async (campaignId: string): Promise<void> => {
    try {
        await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/update/player/remove`,
            method: 'POST',
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) throw new Error('Campanha não encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao sair da campanha');
    }
};

export const transferDungeonMaster = async (
    campaignId: string,
    userToMaster: string
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/update/player/dungeon-master`,
            method: 'PATCH',
            params: { userToMaster },
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) throw new Error('Campanha não encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao transferir função de mestre');
    }
};
