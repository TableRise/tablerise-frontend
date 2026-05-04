import { AxiosError } from 'axios';
import { apiCall, campaignsBaseUrl } from '../wrapper';

export const updateCampaignMusic = async (
    campaignId: string,
    operation: 'add' | 'remove',
    id: string,
    title: string,
    thumbnail: string
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/update/match/musics`,
            method: 'PATCH',
            data: { operation, id, title, thumbnail },
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) throw new Error('Campanha não encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao atualizar músicas');
    }
};
