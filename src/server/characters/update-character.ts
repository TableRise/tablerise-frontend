import { apiCall, charactersBaseUrl } from '../wrapper';

export const updateCharacter = async (
    characterId: string,
    payload: Record<string, unknown>
): Promise<boolean> => {
    try {
        await apiCall({
            baseUrl: charactersBaseUrl,
            endpoint: `${characterId}/update`,
            method: 'PUT',
            data: payload,
        });
        return true;
    } catch {
        return false;
    }
};
