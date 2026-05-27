import { AxiosResponse } from 'axios';
import { apiCall, charactersBaseUrl, campaignsBaseUrl } from '../wrapper';

export const createCharacter = async (payload: object): Promise<any> => {
    const { data }: AxiosResponse = await apiCall({
        baseUrl: charactersBaseUrl,
        endpoint: 'create',
        method: 'POST',
        data: payload,
    });
    return data;
};

export const linkCharacterToCampaign = async (
    campaignId: string,
    characterId: string
): Promise<any> => {
    const { data }: AxiosResponse = await apiCall({
        baseUrl: campaignsBaseUrl,
        endpoint: `${campaignId}/update/player/character/add`,
        method: 'PATCH',
        params: { characterId },
    });
    return data;
};

export const removeCharacterFromCampaign = async (
    campaignId: string,
    characterId: string
): Promise<any> => {
    const { data }: AxiosResponse = await apiCall({
        baseUrl: campaignsBaseUrl,
        endpoint: `${campaignId}/update/player/character/remove`,
        method: 'PATCH',
        params: { characterId },
    });
    return data;
};

export const deleteCharacter = async (characterId: string): Promise<boolean> => {
    try {
        await apiCall({
            baseUrl: charactersBaseUrl,
            endpoint: `${characterId}/delete`,
            method: 'DELETE',
        });
        return true;
    } catch {
        return false;
    }
};
