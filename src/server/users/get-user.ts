import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';
import type { DatabaseUserWithDetails } from '@/types/shared/entities';

export const getUser = async (
    userId: string
): Promise<DatabaseUserWithDetails | null> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}`,
            method: 'GET',
        });

        return {
            ...data,
            details: data?.details,
            result: data?.result,
        };
    } catch ({ response }: AxiosError | any) {
        if (response.status == 404) throw new Error('Usuário não encontrado');
        if (response.status == 500) throw new Error('Erro no servidor');
        return null;
    }
};
