import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, charactersBaseUrl } from '../wrapper';

export interface CharacterAuthor {
    userId: string;
    nickname: string;
    fullname: string;
}

export interface CharacterDnd {
    characterId: string;
    campaignId?: string;
    author: CharacterAuthor;
    profile: {
        name: string;
        class: string;
        race: string;
        level: number;
    };
    npc: boolean;
    createdAt: string;
    updatedAt: string;
}

export const getCharactersByCampaign = async (
    campaignId: string
): Promise<CharacterDnd[]> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: charactersBaseUrl,
            endpoint: `by-campaign/${campaignId}`,
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
