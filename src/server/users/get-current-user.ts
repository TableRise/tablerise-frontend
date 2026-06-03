import { AxiosError, AxiosResponse } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';
import type { DatabaseUserWithDetails } from '@/types/shared/entities';

export const getCurrentUser = async (): Promise<DatabaseUserWithDetails | null> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'me',
            method: 'GET',
        });

        return {
            ...data,
            details: data?.details,
            result: data?.result,
        };
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 401) return null;
        if (response?.status === 404) return null;
        if (response?.status === 500) throw new Error('Erro no servidor');
        throw new Error('Algo deu errado');
    }
};
