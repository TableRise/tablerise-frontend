import { AxiosError } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';

export type PostSupportPayload = {
    title: string;
    content: string;
    category: string;
    campaignCode?: string;
};

export const postSupport = async (
    userId: string,
    payload: PostSupportPayload
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/support/post`,
            method: 'POST',
            data: payload,
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 400) {
            throw new Error('*Dados inválidos. Verifique os campos e tente novamente.');
        }

        if (response?.status === 401) {
            throw new Error('*Faça login novamente para enviar sua solicitação.');
        }

        if (response?.status === 404) {
            throw new Error('*Usuário não encontrado.');
        }

        if (response?.status === 500) {
            throw new Error('*Erro no servidor. Tente novamente.');
        }

        throw new Error('*Não foi possível enviar sua solicitação. Tente novamente.');
    }
};
