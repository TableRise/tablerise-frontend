import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, campaignsBaseUrl } from '../wrapper';

export interface JournalPostAuthor {
    userId: string;
    characterIds: string[];
    role: string;
    status: string;
}

export interface JournalPost {
    title: string;
    author: JournalPostAuthor;
    content: string;
    timestamp: string;
    category: string;
}

export const getCampaignJournalPosts = async (
    campaignId: string
): Promise<JournalPost[]> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/journal/posts`,
            method: 'GET',
        });
        return data;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) return [];
        if (status === 500) throw new Error('Erro no servidor');
        return [];
    }
};

export interface CreateJournalPostPayload {
    title: string;
    content: string;
    category: string;
}

export const createJournalPost = async (
    campaignId: string,
    payload: CreateJournalPostPayload
): Promise<boolean> => {
    try {
        await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/journal/post`,
            method: 'POST',
            data: payload,
        });
        return true;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 400) throw new Error('Dados inválidos');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao criar post');
    }
};
