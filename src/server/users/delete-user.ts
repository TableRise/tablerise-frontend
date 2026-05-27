import { AxiosError } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';

export const deleteUser = async (userId: string): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/delete`,
            method: 'DELETE',
        });
    } catch ({ response }: AxiosError | any) {
        const backendMessage =
            response?.data?.message ??
            response?.data?.error ??
            response?.data?.result?.message ??
            response?.data;

        if (
            typeof backendMessage === 'string' &&
            backendMessage.includes(
                'There is a campaign or character linked to this user'
            )
        ) {
            throw new Error(
                '*Voce ainda possui campanhas ou personagens vinculados a esta conta.'
            );
        }

        if (response?.status === 404) throw new Error('*Usuario nao encontrado.');
        if (response?.status === 500)
            throw new Error('*Erro no servidor. Tente novamente.');

        throw new Error('*Algo deu errado. Tente novamente.');
    }
};
