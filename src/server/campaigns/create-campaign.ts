import { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';
import { campaignsBaseUrl } from '../wrapper';

const CAMPAIGN_DESCRIPTION_MAX_LENGTH = 240;

export interface CampaignMusic {
    id: string;
    title: string;
    thumbnail: string;
}

export interface CreateCampaignPayload {
    title: string;
    description: string;
    system: string;
    ageRestriction: string;
    visibility: string;
    password: string;
    musics: CampaignMusic[];
    coverImage?: File | null;
    mapImages: File[];
    mainHistory: string;
    nextMatchDate: string[];
    playerAmountLimit: number;
    socialMedia: { discord?: string; twitter?: string; youtube?: string };
    configurations: {
        xpSystem: boolean;
        shopSystem: boolean;
    };
}

export const createCampaign = async (payload: CreateCampaignPayload) => {
    try {
        const formData = new FormData();
        formData.append('title', payload.title);
        formData.append(
            'description',
            payload.description.slice(0, CAMPAIGN_DESCRIPTION_MAX_LENGTH)
        );
        formData.append('system', payload.system);
        formData.append('ageRestriction', payload.ageRestriction);
        formData.append('visibility', payload.visibility);
        formData.append('musics', JSON.stringify(payload.musics));
        formData.append('mainHistory', payload.mainHistory);
        formData.append('playerAmountLimit', String(payload.playerAmountLimit));
        formData.append('configurations', JSON.stringify(payload.configurations));
        if (payload.password) formData.append('password', payload.password);
        if (payload.coverImage) formData.append('cover', payload.coverImage);
        if (payload.nextMatchDate.length > 0) {
            formData.append('nextMatchDate', JSON.stringify(payload.nextMatchDate[0]));
        }
        payload.mapImages.forEach((file) => {
            formData.append('mapImages', file);
        });
        if (Object.values(payload.socialMedia).some((v) => v)) {
            formData.append('socialMedia', JSON.stringify(payload.socialMedia));
        }

        const { data }: AxiosResponse = await axios({
            method: 'POST',
            url: `${campaignsBaseUrl}/create`,
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
                [process.env.NEXT_PUBLIC_TYPE_KEY as string]:
                    process.env.NEXT_PUBLIC_API_ACCESS_KEY,
            },
            data: formData,
        });

        return data;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 409) throw new Error('Já existe uma campanha com esse nome');
        if (status === 400) throw new Error('Dados inválidos');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao criar campanha');
    }
};
