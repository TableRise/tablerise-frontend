import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, campaignsBaseUrl } from '../wrapper';

export interface CampaignPlayer {
    userId: string;
    characterIds: string[];
    role: string;
    status: string;
}

export const getCampaignPlayers = async (
    campaignId: string
): Promise<CampaignPlayer[]> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/players`,
            method: 'GET',
        });
        return data;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) return [];
        if (status === 500) throw new Error('Erro no servidor');
        return [];
    }
};
