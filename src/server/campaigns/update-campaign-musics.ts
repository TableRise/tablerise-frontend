import { AxiosError } from 'axios';
import { apiCall, campaignsBaseUrl } from '../wrapper';

export const updateCampaignMusic = async (
    campaignId: string,
    operation: 'add' | 'remove' | 'edit',
    id: string,
    title?: string,
    thumbnail?: string
): Promise<void> => {
    try {
        const endpoint = `${campaignId}/update/match/musics/${operation}`;
        const data =
            operation === 'remove'
                ? { id }
                : {
                      id,
                      title: title ?? '',
                      thumbnail: thumbnail ?? '',
                  };

        await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint,
            method: 'PATCH',
            data,
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) throw new Error('Campanha não encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao atualizar músicas');
    }
};
