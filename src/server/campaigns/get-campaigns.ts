import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, campaignsBaseUrl } from '../wrapper';

export const getCampaignsByUserId = async (userId: string) => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `user/${userId}`,
            method: 'GET',
        });

        return data;
    } catch ({ response }: AxiosError | any) {
        if (response.status == 404) throw new Error('Campanhas não encontradas');
        if (response.status == 500) throw new Error('Erro no servidor');
    }
};
