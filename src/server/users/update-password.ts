import { AxiosError, AxiosResponse } from 'axios';
import { apiUser } from './api';

type Response = {
    userId: string;
    userStatus: string;
    accountSecurityMethod: 'secret-question' | 'two-factor' | '';
    secretQuestion?: string;
    lastUpdate: string;
};

export const sendConfirmEmail = async (email: string) => {
    try {
        await apiUser.get('/verify', {
            params: { email, flow: 'update-password' },
        });
    } catch ({ response: { data } }: AxiosError | any) {
        throw new Error(data.message);
    }
};

export const authenticateEmail = async (email: string, code: string) => {
    try {
        const { data }: AxiosResponse<Response> = await apiUser.patch(
            '/authenticate/email',
            null,
            {
                params: { email, code, flow: 'update-password' },
            }
        );

        return data;
    } catch ({ response: { data } }: AxiosError | any) {
        throw new Error(data.message);
    }
};

export const authenticate2fa = async (email: string, code: string) => {
    try {
        const response: AxiosResponse<Response> = await apiUser.patch(
            '/authenticate/2fa',
            null,
            {
                params: { email, token: code, flow: 'update-password' },
            }
        );

        return response;
    } catch ({ response: { data } }: AxiosError | any) {
        throw new Error(data.message);
    }
};

export const authenticateSecretQuestion = async (
    email: string,
    question: string,
    answer: string
) => {
    try {
        const { data }: AxiosResponse<Response> = await apiUser.patch(
            '/authenticate/secret-question',
            { question, answer },
            {
                params: { email, flow: 'update-password' },
            }
        );

        return data;
    } catch ({ response: { data } }: AxiosError | any) {
        throw new Error(data.message);
    }
};

export const sendNewPassword = async (email: string, newPassword: string) => {
    try {
        await apiUser.patch(
            '/update/password',
            {
                password: newPassword,
            },
            {
                params: { email },
            }
        );
    } catch ({ response: { data } }: AxiosError | any) {
        throw new Error(data.message);
    }
};
