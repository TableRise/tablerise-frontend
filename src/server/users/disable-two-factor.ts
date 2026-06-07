import { AxiosError } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';

export const confirmDisableTwoFactorCode = async (
    email: string,
    token: string
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'authenticate/2fa',
            method: 'POST',
            params: { email, token, flow: 'disable-two-factor' },
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 400)
            throw new Error('*Dados invalidos. Verifique o codigo e tente novamente.');
        if (response?.status === 401)
            throw new Error('*Codigo do autenticador invalido.');
        if (response?.status === 500)
            throw new Error('*Erro no servidor. Tente novamente.');
        throw new Error('*Nao foi possivel validar o codigo do autenticador.');
    }
};

export const deactivateUserTwoFactor = async (userId: string): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/2fa/deactivate`,
            method: 'PATCH',
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 404) throw new Error('*usuário nao encontrado.');
        if (response?.status === 500)
            throw new Error('*Erro no servidor. Tente novamente.');
        throw new Error('*Nao foi possivel desabilitar os dois fatores.');
    }
};
