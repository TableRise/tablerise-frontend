import axios, { AxiosError } from 'axios';
import { usersBaseUrl } from '../wrapper';
import {
    appendUploadImageValue,
    type UploadImageValue,
} from '@/utils/imageUploadPayload';

export const updateUserPicture = async (
    userId: string,
    picture: UploadImageValue
): Promise<void> => {
    const formData = new FormData();
    appendUploadImageValue(formData, 'picture', picture);

    try {
        await axios({
            method: 'POST',
            url: `${usersBaseUrl}/${userId}/update/picture`,
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

        throw new Error('Não foi possivel atualizar a foto do perfil');
    }
};
