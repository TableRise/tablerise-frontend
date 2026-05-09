import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';
import type { DatabaseCampaignGroupsResponse } from '@/types/shared/entities';

export const getCampaignsByUserId = async (
    userId: string
): Promise<DatabaseCampaignGroupsResponse | undefined> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/campaigns`,
            method: 'GET',
        });

        return data;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 400) throw new Error('Erro no preenchimento de dados');
        if (status === 404) return { master: [], player: [] };
        if (status === 500) throw new Error('Erro no servidor');
    }
};
