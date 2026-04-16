import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';

export const getUser = async (userId: string) => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}`,
            method: 'GET',
        });

        console.log(data);

        return data;
    } catch ({ response }: AxiosError | any) {
        if (response.status == 404) throw new Error('Usuário não encontrado');
        if (response.status == 500) throw new Error('Erro no servidor');
    }
};
