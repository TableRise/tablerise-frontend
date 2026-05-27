import { AxiosError } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';
import type { CompleteProfileUserPayload } from '@/components/login/schemas/CompleteOAuthUserSchema';

export type UpdateUserDetailsPayload = Partial<CompleteProfileUserPayload> & {
    biography?: string;
};

export const updateUser = async (
    userId: string,
    payload: UpdateUserDetailsPayload
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/update/details`,
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
