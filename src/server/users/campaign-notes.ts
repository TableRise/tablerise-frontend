import { AxiosError } from 'axios';
import { getCampaignById } from '@/server/campaigns/join-campaign';
import { apiCall, campaignsBaseUrl, usersBaseUrl } from '../wrapper';

export interface CampaignNote {
    id?: string;
    title: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;
}

interface CreateCampaignNotePayload {
    title: string;
    content: string;
}

interface UpdateCampaignNotePayload {
    content: string;
}

function normalizeNote(note: any): CampaignNote | null {
    if (!note || typeof note !== 'object') return null;
    if (typeof note.title !== 'string' || typeof note.content !== 'string') return null;

    return {
        id: typeof note.id === 'string' ? note.id : undefined,
        title: note.title,
        content: note.content,
        createdAt: typeof note.createdAt === 'string' ? note.createdAt : undefined,
        updatedAt: typeof note.updatedAt === 'string' ? note.updatedAt : undefined,
    };
}

export const getUserCampaignNotes = async (
    userId: string,
    campaignId: string
): Promise<CampaignNote[]> => {
    try {
        const campaign = await getCampaignById(campaignId);

        if (!campaign) return [];

        const player = (campaign.campaignPlayers ?? []).find(
            (entry: any) => entry?.userId === userId
        );

        if (!Array.isArray(player?.notes)) return [];

        return player.notes
            .map(normalizeNote)
            .filter((note): note is CampaignNote => note !== null);
    } catch (error) {
        throw error;
    }
};

export const updateCampaignNote = async (
    campaignId: string,
    title: string,
    payload: UpdateCampaignNotePayload
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/update/notes`,
            method: 'PATCH',
            params: { title },
            data: payload,
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 400) throw new Error('Dados inválidos');
        if (response?.status === 404) throw new Error('Anotação não encontrada');
        if (response?.status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao atualizar anotação');
    }
};

export const removeCampaignNote = async (
    campaignId: string,
    title: string
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/update/notes/remove`,
            method: 'PATCH',
            params: { title },
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 400) throw new Error('Dados inválidos');
        if (response?.status === 404) throw new Error('Anotação não encontrada');
        if (response?.status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao remover anotação');
    }
};

export const createUserCampaignNote = async (
    userId: string,
    campaignId: string,
    payload: CreateCampaignNotePayload
): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/update/campaign/notes`,
            method: 'PATCH',
            params: { campaignId },
            data: payload,
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 400) throw new Error('Dados inválidos');
        if (response?.status === 404) throw new Error('Usuário não encontrado');
        if (response?.status === 500) throw new Error('Erro no servidor');
        throw new Error('Erro ao salvar anotação');
    }
};
