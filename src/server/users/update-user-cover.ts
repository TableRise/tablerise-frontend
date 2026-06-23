import { AxiosError } from 'axios';
import axios from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';
import {
    appendUploadImageValue,
    type UploadImageValue,
} from '@/utils/imageUploadPayload';

export const updateUserCover = async (
    userId: string,
    image: UploadImageValue
): Promise<void> => {
    const formData = new FormData();
    appendUploadImageValue(formData, 'image', image);

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

        if (status === 404) throw new Error('usuário não encontrado');
        if (status === 413) throw new Error('A imagem selecionada e muito grande');
        if (status === 415) throw new Error('Formato de imagem não suportado');
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Não foi possivel atualizar o plano de fundo do perfil');
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

        if (status === 404) throw new Error('usuário não encontrado');
        if (status === 500) throw new Error('Erro no servidor');

        throw new Error('Não foi possivel remover o plano de fundo do perfil');
    }
};
