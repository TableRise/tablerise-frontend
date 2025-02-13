import { AxiosError, AxiosResponse } from 'axios';
import { apiCall } from '../wrapper';
import { LoginPayload } from '@/components/login/schemas/LoginSchema';

const usersBaseUrl = process.env.API_USERS;

export const postLogin = async (payload: LoginPayload): Promise<AxiosResponse | any> => {
    try {
        const result = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'login',
            method: 'POST',
            data: payload,
        });

        return result;
    } catch ({ response }: AxiosError | any) {
        if (response.status == 401)
            throw new Error('*Dados de email ou senha incorretos. Tente novamente.');
        if (response.status !== 200)
            throw new Error('*Algo deu errado. Tente novamente.');
    }
};
