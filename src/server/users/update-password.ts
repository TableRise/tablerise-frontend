import { AxiosError, AxiosResponse } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';

type Response = {
    userId: string;
    userStatus: string;
    accountSecurityMethod: string;
    lastUpdate: string;
};

export const sendConfirmEmail = async (email: string) => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'verify',
            method: 'GET',
            params: { email, flow: 'update-password' },
        });
    } catch ({ response }: AxiosError | any) {
        if (response.status == 404) throw new Error('Email não encontrado');
        if (response.status == 500) throw new Error('Erro no servidor');
    }
};

export const authenticateEmail = async (email: string, code: string) => {
    try {
        const { data }: AxiosResponse<Response> = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'authenticate/email',
            method: 'PATCH',
            params: { email, code, flow: 'update-password' },
        });

        return data;
    } catch ({ response }: AxiosError | any) {
        if (response.status == 400)
            throw new Error(
                'Nenhum ID ou e-mail foi fornecido para validar o código de e-mail'
            );
        if (response.status == 422)
            throw new Error('Código de verificação de e-mail inválido');
        if (response.status == 500) throw new Error('Erro no servidor');
        throw new Error(response.message);
    }
};

export const authenticate2fa = async (email: string, code: string) => {
    try {
        const { status }: AxiosResponse<Response> = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'authenticate/2fa',
            method: 'PATCH',
            params: { email, token: code, flow: 'update-password' },
        });

        return status;
    } catch ({ response }: AxiosError | any) {
        if (response.status == 400) throw new Error('2FA não ativado para este usuário');
        if (response.status == 401) throw new Error('Codigo 2FA incorreto');
        if (response.status == 500) throw new Error('Erro no servidor');
    }
};

export const authenticateSecretQuestion = async (
    email: string,
    question: string,
    answer: string
) => {
    try {
        const { status }: AxiosResponse<Response> = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'authenticate/secret-question',
            method: 'PATCH',
            data: { question, answer },
            params: { email, flow: 'update-password' },
        });

        return status;
    } catch ({ response }: AxiosError | any) {
        if (response.status == 401) throw new Error('A resposta está incorreta');
        if (response.status == 500) throw new Error('Erro no servidor');
    }
};

export const sendNewPassword = async (email: string, newPassword: string) => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'update/password',
            method: 'PATCH',
            data: { password: newPassword },
            params: { email },
        });
    } catch ({ response }: AxiosError | any) {
        if (response.status == 400)
            throw new Error('O status do usuário é inválido para realizar esta operação');
        if (response.status == 500) throw new Error('Erro no servidor');
    }
};
