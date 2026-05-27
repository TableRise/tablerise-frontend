import { AxiosError } from 'axios';
import { apiCall } from '../wrapper';

const usersBaseUrl = process.env.API_USERS;

export const postLogout = async (): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'logout',
            method: 'GET',
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status !== 200)
            throw new Error('Erro ao deslogar. Tente novamente.');
    }
};
