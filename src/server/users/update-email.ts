import { AxiosError } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';

export const sendUpdateEmailCode = async (email: string): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'authenticate/email/send-code',
            method: 'POST',
            params: { email, flow: 'update-email' },
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 404) throw new Error('*Email nao encontrado.');
        if (response?.status === 500)
            throw new Error('*Erro no servidor ao enviar o codigo.');
        throw new Error('*Nao foi possivel enviar o codigo de verificacao.');
    }
};

export const confirmUpdateEmailCode = async (
    email: string,
    code: string
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'authenticate/email',
            method: 'POST',
            params: { email, code, flow: 'update-email' },
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 400)
            throw new Error('*Dados invalidos. Verifique o codigo e tente novamente.');
        if (response?.status === 422)
            throw new Error('*Codigo de verificacao de e-mail invalido.');
        if (response?.status === 500)
            throw new Error('*Erro no servidor. Tente novamente.');
        throw new Error('*Nao foi possivel validar o codigo informado.');
    }
};

export const updateUserEmail = async (userId: string, email: string): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/update/email`,
            method: 'PATCH',
            data: { email },
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 400)
            throw new Error('*Email invalido. Verifique o endereco informado.');
        if (response?.status === 409)
            throw new Error('*Este e-mail ja esta em uso por outra conta.');
        if (response?.status === 404) throw new Error('*usuário nao encontrado.');
        if (response?.status === 500)
            throw new Error('*Erro no servidor. Tente novamente.');
        throw new Error('*Nao foi possivel atualizar o e-mail.');
    }
};
