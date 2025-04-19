import { AxiosError, AxiosResponse } from 'axios';
import { apiCall } from '../wrapper';
import { LoginPayload } from '@/components/login/schemas/LoginSchema';

const usersBaseUrl = process.env.API_USERS;
// const usersBaseUrl = 'http://localhost:3001/users/login';

export const postLogin = async (payload: LoginPayload): Promise<AxiosResponse | any> => {
    try {
        console.log('usersBaseUrl no login ---------', `${usersBaseUrl}`);
        const result = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'login',
            method: 'POST',
            data: payload,
        });

        return result;
    } catch ({ response }: AxiosError | any) {
        if (response.status == 404) throw new Error('*Usuario não cadastrado');
        if (response.status == 401)
            throw new Error('*Dados de email ou senha incorretos. Tente novamente.');
        if (response.status !== 200)
            throw new Error('*Algo deu errado. Tente novamente.');
    }
};
