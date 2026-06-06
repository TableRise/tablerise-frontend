import { AxiosError } from 'axios';
import axios from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';

export const updateUserCover = async (userId: string, image: File): Promise<void> => {
    const formData = new FormData();
    formData.append('image', image);

    try {
        await axios({
            method: 'PATCH',
            url: `${usersBaseUrl}/${userId}/update/cover`,
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;

        if (status === 404) throw new Error('Usuario nao encontrado');
        if (status === 413) throw new Error('A imagem selecionada e muito grande');
        if (status === 415) throw new Error('Formato de imagem nao suportado');
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Nao foi possivel atualizar o plano de fundo do perfil');
    }
};

export const removeUserCover = async (userId: string): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/update/cover/remove`,
            method: 'PATCH',
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;

        if (status === 404) throw new Error('Usuario nao encontrado');
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Nao foi possivel remover o plano de fundo do perfil');
    }
};
