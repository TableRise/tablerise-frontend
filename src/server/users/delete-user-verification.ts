import { AxiosError } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';

export const sendDeleteUserEmailCode = async (email: string): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'authenticate/email/send-code',
            method: 'POST',
            params: { email, flow: 'delete-user' },
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 404) throw new Error('*Email não encontrado.');
        if (response?.status === 500)
            throw new Error('*Erro no servidor ao enviar o codigo.');

        throw new Error('*Não foi possivel enviar o codigo de verificação.');
    }
};

export const confirmDeleteUserEmailCode = async (
    email: string,
    code: string
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: 'authenticate/email',
            method: 'POST',
            params: { email, code, flow: 'delete-user' },
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 400)
            throw new Error('*Dados invalidos. Verifique o codigo e tente novamente.');
        if (response?.status === 422)
            throw new Error('*Codigo de verificação de e-mail invalido.');
        if (response?.status === 500)
            throw new Error('*Erro no servidor. Tente novamente.');

        throw new Error('*Não foi possivel validar o codigo informado.');
    }
};
