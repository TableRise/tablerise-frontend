import { AxiosError } from 'axios';
import { apiCall, campaignsBaseUrl } from '../wrapper';

export interface CreateCampaignBuyPayload {
    name: string;
    cost: string;
    character: string;
    user: string;
    date: string;
}

export const createCampaignBuy = async (
    campaignId: string,
    payload: CreateCampaignBuyPayload
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/buys`,
            method: 'POST',
            data: payload,
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 400) throw new Error('Dados inválidos');
        if (status === 404) throw new Error('Campanha não encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao salvar compra no histórico');
    }
};
