import { AxiosError } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';

export const sendActivateTwoFactorEmailCode = async (email: string): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'authenticate/email/send-code',
            method: 'POST',
            params: { email, flow: 'activate-two-factor' },
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 404) throw new Error('*Email Não encontrado.');
        if (response?.status === 500)
            throw new Error('*Erro no servidor ao enviar o código.');
        throw new Error('*Não foi possível enviar o código de verificação.');
    }
};

export const confirmActivateTwoFactorEmailCode = async (
    email: string,
    code: string
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'authenticate/email',
            method: 'POST',
            params: { email, code, flow: 'activate-two-factor' },
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 400)
            throw new Error('*Dados inválidos. Verifique o código e tente novamente.');
        if (response?.status === 422)
            throw new Error('*código de verificação de e-mail inválido.');
        if (response?.status === 500)
            throw new Error('*Erro no servidor. Tente novamente.');
        throw new Error('*Não foi possível validar o código informado.');
    }
};

export const activateUserTwoFactor = async (userId: string): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/2fa/activate`,
            method: 'PATCH',
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 404) throw new Error('*Usuário Não encontrado.');
        if (response?.status === 500)
            throw new Error('*Erro no servidor ao ativar o 2FA.');
        throw new Error('*Não foi possível ativar o 2FA.');
    }
};

export const confirmActivateTwoFactorAppCode = async (
    email: string,
    token: string
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'authenticate/2fa',
            method: 'POST',
            params: { email, token, flow: 'activate-two-factor' },
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 400) throw new Error('*2FA ainda Não ativado.');
        if (response?.status === 401)
            throw new Error('*código do autenticador inválido.');
        if (response?.status === 500)
            throw new Error('*Erro no servidor. Tente novamente.');
        throw new Error('*Não foi possível validar o código do aplicativo.');
    }
};
