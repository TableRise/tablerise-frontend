import { AxiosResponse } from 'axios';
import { apiCall } from '../wrapper';
import { LoginPayload } from '@/components/login/schemas/LoginSchema';

const usersBaseUrl = process.env.API_USERS;

export const postLogin = async (payload: LoginPayload): Promise<AxiosResponse> => {
    try {
        const result = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'login',
            method: 'POST',
            data: payload,
        });

        return result;
    } catch (error) {
        return { status: 500 } as AxiosResponse;
    }
};
