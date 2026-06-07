import { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';
import { apiCall, campaignsBaseUrl } from '../wrapper';
import type { ImageObject } from '@/types/shared/general';
import {
    appendMultiUploadImageValues,
    appendUploadImageValue,
    type UploadImageValue,
} from '@/utils/imageUploadPayload';

function normalizeImagesResponse(data: any): ImageObject[] {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.images)) {
        return data.images;
    }

    return [];
}

function normalizeHighlightedImageResponse(data: any): ImageObject | null {
    if (data?.imageHighlighted) {
        return data.imageHighlighted;
    }

    if (data?.imageHighlight) {
        return data.imageHighlight;
    }

    if (data?.link || data?.id) {
        return data;
    }

    return null;
}

export const uploadMatchHighlightImages = async (
    campaignId: string,
    image: UploadImageValue
): Promise<ImageObject[]> => {
    const formData = new FormData();
    appendMultiUploadImageValues(formData, 'images', [image]);

    try {
        const { data }: AxiosResponse = await axios({
            method: 'PATCH',
            url: `${campaignsBaseUrl}/${campaignId}/update/match/images`,
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
        });

        return normalizeImagesResponse(data);
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) throw new Error('Campanha nao encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao enviar imagem');
    }
};

export const setMatchHighlightedImage = async (
    campaignId: string,
    imageId?: string,
    remove?: boolean
): Promise<ImageObject | null> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/update/match/images/highlight`,
            method: 'PATCH',
            params: remove ? { remove: true } : { imageId },
        });

        return normalizeHighlightedImageResponse(data);
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) throw new Error('Campanha ou imagem nao encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error(
            remove ? 'Erro ao remover imagem destacada' : 'Erro ao destacar imagem'
        );
    }
};
