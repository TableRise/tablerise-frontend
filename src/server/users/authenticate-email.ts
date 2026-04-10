import { AxiosError } from 'axios';
import { apiCall } from '../wrapper';

const usersBaseUrl = process.env.API_USERS;

export const postAuthenticateEmail = async (
    email: string,
    code: string
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'authenticate/email',
            method: 'POST',
            params: { email, code, flow: 'create-user' },
        });
    } catch ({ response }: AxiosError | any) {
        throw new Error('*Código de confirmação invalido');
    }
};
