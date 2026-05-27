import { AxiosError } from 'axios';
import { apiCall, campaignsBaseUrl } from '../wrapper';

export interface CreateCampaignLogPayload {
    content: string;
    loggedAt: string;
}

export const createCampaignLog = async (
    campaignId: string,
    payload: CreateCampaignLogPayload
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/logs`,
            method: 'POST',
            data: payload,
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 400) throw new Error('Dados inválidos');
        if (status === 404) throw new Error('Campanha não encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao criar log da campanha');
    }
};
