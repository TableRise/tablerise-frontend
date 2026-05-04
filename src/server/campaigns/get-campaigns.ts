import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';

export const getCampaignsByUserId = async (userId: string) => {
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
