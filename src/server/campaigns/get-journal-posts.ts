import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, campaignsBaseUrl } from '../wrapper';

export interface JournalPostAuthor {
    userId: string;
    characterIds: string[];
    role: string;
    status: string;
}

export interface JournalPost {
    postId: string;
    title: string;
    author: JournalPostAuthor;
    content: string;
    timestamp: string;
    category: string;
}

export interface HighlightedJournalPostResponse {
    postId: string;
    title: string;
    author: string;
    content: string;
    timestamp: string;
    category: string;
}

export type JournalHighlightTogglePayload =
    | {
          post: JournalPost;
          toggle: 'on';
      }
    | {
          toggle: 'off';
      };

function normalizeHighlightedJournalPost(post: any): JournalPost | null {
    if (!post || typeof post !== 'object') return null;

    if (
        typeof post.title !== 'string' ||
        typeof post.content !== 'string' ||
        typeof post.timestamp !== 'string' ||
        typeof post.category !== 'string'
    ) {
        return null;
    }

    return {
        postId: typeof post.postId === 'string' ? post.postId : '',
        title: post.title,
        content: post.content,
        timestamp: post.timestamp,
        category: post.category,
        author: {
            userId: '',
            characterIds: [],
            role: typeof post.author === 'string' ? post.author : '',
            status: '',
        },
    };
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

export const getCampaignHighlightedJournalPost = async (
    campaignId: string
): Promise<JournalPost | null> => {
    try {
        const { data }: AxiosResponse<HighlightedJournalPostResponse | null> =
            await apiCall({
                baseUrl: campaignsBaseUrl,
                endpoint: `${campaignId}/journal/highlight`,
                method: 'GET',
            });

        return normalizeHighlightedJournalPost(data);
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 404) return null;
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao carregar destaque do jornal');
    }
};

export interface CreateJournalPostPayload {
    title: string;
    content: string;
    category: string;
}

export interface UpdateJournalPostPayload {
    postId: string;
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

export const deleteCampaignJournalPost = async (
    campaignId: string,
    post: JournalPost,
    userId: string
): Promise<boolean> => {
    try {
        await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/journal/delete`,
            method: 'PATCH',
            params: { userId, postId: post.postId },
        });
        return true;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 400) throw new Error('Dados invÃ¡lidos');
        if (status === 404) throw new Error('Publicação não encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao excluir post');
    }
};

export const updateCampaignJournalPost = async (
    campaignId: string,
    userId: string,
    payload: UpdateJournalPostPayload
): Promise<boolean> => {
    try {
        await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/journal/update`,
            method: 'PATCH',
            params: { userId },
            data: {
                postId: payload.postId,
                title: payload.title,
                post: payload.content,
                category: payload.category,
            },
        });
        return true;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 400) throw new Error('Dados invÃ¡lidos');
        if (status === 404) throw new Error('Publicação não encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao atualizar post');
    }
};

export const setCampaignHighlightedJournalPost = async (
    campaignId: string,
    payload: JournalHighlightTogglePayload
): Promise<boolean> => {
    try {
        await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/update/journal/highlight`,
            method: 'PATCH',
            data: payload,
        });
        return true;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 400) throw new Error('Dados invÃ¡lidos');
        if (status === 404) throw new Error('Publicação não encontrada');
        if (status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao atualizar destaque do jornal');
    }
};
