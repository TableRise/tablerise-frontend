import { AxiosError } from 'axios';
import { apiCall, campaignsBaseUrl } from '../wrapper';

export interface UpdateCampaignPayload {
    title?: string;
    description?: string;
    nextMatchDate?: string;
    socialMedia?: { discord?: string; twitter?: string; youtube?: string };
    nextSessionResume?: string;
    visibility?: string;
    ageRestriction?: string;
    playerAmountLimit?: number;
    configurations?: {
        shopOn: boolean;
    };
    adminId?: string;
}

export const updateCampaign = async (
    campaignId: string,
    payload: UpdateCampaignPayload
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/update`,
            method: 'PUT',
            data: payload,
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) throw new Error('Campanha não encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao atualizar campanha');
    }
};
