import { AxiosError } from 'axios';
import { apiCall } from '../wrapper';

const usersBaseUrl = process.env.API_USERS;

export const postRegister = async (payload: any) => {
    try {
        const { data } = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'register',
            method: 'POST',
            data: payload,
        });
        return data;
    } catch ({ response }: AxiosError | any) {
        if (response.status == 400) throw new Error('Email já cadatrado');
        if (response.status == 500) throw new Error('Erro no servidor');
    }
};
