import { apiCall, charactersBaseUrl } from '../wrapper';

export const updateCharacter = async (
    characterId: string,
    payload: Record<string, any>
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

export const addCharacterEquipment = async (
    characterId: string,
    equipmentId: string
): Promise<boolean> => {
    try {
        await apiCall({
            baseUrl: charactersBaseUrl,
            endpoint: `${characterId}/update/equipments/add`,
            method: 'PATCH',
            params: { equipmentId },
        });
        return true;
    } catch {
        return false;
    }
};

export const removeCharacterEquipment = async (
    characterId: string,
    equipmentId: string
): Promise<boolean> => {
    try {
        await apiCall({
            baseUrl: charactersBaseUrl,
            endpoint: `${characterId}/update/equipments/remove`,
            method: 'PATCH',
            params: { equipmentId },
        });
        return true;
    } catch {
        return false;
    }
};

export const updateCharacterMoney = async (
    characterId: string,
    payload: {
        operation: 'add' | 'subtract';
        money: number;
        moneyType: string;
    }
): Promise<boolean> => {
    try {
        await apiCall({
            baseUrl: charactersBaseUrl,
            endpoint: `${characterId}/update/money`,
            method: 'PATCH',
            data: payload,
        });
        return true;
    } catch {
        return false;
    }
};

export const updateCharacterNotificationsOff = async (
    characterId: string
): Promise<boolean> => {
    try {
        await apiCall({
            baseUrl: charactersBaseUrl,
            endpoint: `${characterId}/update/notifications/off`,
            method: 'PATCH',
        });
        return true;
    } catch {
        return false;
    }
};
