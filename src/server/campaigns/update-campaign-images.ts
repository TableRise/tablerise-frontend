import { AxiosError } from 'axios';
import axios from 'axios';
import { apiCall, campaignsBaseUrl } from '../wrapper';

export const updateCampaignCover = async (
    campaignId: string,
    cover: File
): Promise<void> => {
    const formData = new FormData();
    formData.append('picture', cover);

    try {
        await axios({
            method: 'PATCH',
            url: `${campaignsBaseUrl}/${campaignId}/update/cover`,
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) throw new Error('Campanha não encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao atualizar capa');
    }
};

export const updateCampaignMapImages = async (
    campaignId: string,
    mapImages: File[]
): Promise<void> => {
    const formData = new FormData();
    mapImages.forEach((file) => formData.append('mapImages', file));

    try {
        await axios({
            method: 'PATCH',
            url: `${campaignsBaseUrl}/${campaignId}/update/match/map-images/add`,
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) throw new Error('Campanha não encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao atualizar mapas');
    }
};

export const removeCampaignImage = async (
    campaignId: string,
    type: 'cover' | 'mapImages',
    imageUrl?: string
): Promise<void> => {
    try {
        const endpoint =
            type === 'cover'
                ? `${campaignId}/update/cover/remove`
                : `${campaignId}/update/match/map-images/remove`;
        const params = type === 'mapImages' ? { imageUrl } : undefined;

        await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint,
            method: 'PATCH',
            params,
        });
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) throw new Error('Campanha não encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao remover imagem');
    }
};
