import { AxiosError } from 'axios';
import { apiCall, oAuthBaseUrl } from '../wrapper';

export interface CompleteOAuthUserPayload {
    nickname: string;
    firstName: string;
    lastName: string;
    birthday: string;
}

export const postCompleteOAuthUser = async (
    userId: string,
    payload: CompleteOAuthUserPayload
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: oAuthBaseUrl,
            endpoint: `${userId}/complete`,
            method: 'PUT',
            data: payload,
        });
    } catch ({ response }: AxiosError | any) {
        if (response.status === 400)
            throw new Error('*Dados inválidos. Verifique os campos e tente novamente.');
        if (response.status === 404) throw new Error('*Usuário não encontrado.');
        if (response.status === 500)
            throw new Error('*Erro no servidor. Tente novamente.');
        throw new Error('*Algo deu errado. Tente novamente.');
    }
};
