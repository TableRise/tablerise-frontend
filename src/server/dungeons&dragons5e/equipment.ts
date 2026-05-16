import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, dndBaseUrl } from '../wrapper';

export type DndEquipmentRecord = {
    equipmentId: string;
    active: boolean;
    name: string;
    type: string;
    price: Array<number | string>;
    armorClass?: Array<number | string>;
    strength?: string;
    stealth?: string;
    weight: string;
    damage?: string;
    properties?: string;
};

function normalizeLocalizedEntity<T>(entity: any): T {
    if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
        return entity as T;
    }

    const englishContent =
        entity.en && typeof entity.en === 'object' && !Array.isArray(entity.en)
            ? entity.en
            : {};
    const portugueseContent =
        entity.pt && typeof entity.pt === 'object' && !Array.isArray(entity.pt)
            ? entity.pt
            : {};

    if (
        Object.keys(englishContent).length === 0 &&
        Object.keys(portugueseContent).length === 0
    ) {
        return entity as T;
    }

    return {
        ...entity,
        ...englishContent,
        ...portugueseContent,
    } as T;
}

export const getDnd5eEquipment = async (): Promise<DndEquipmentRecord[]> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: dndBaseUrl,
            endpoint: 'equipment',
            method: 'GET',
        });

        return Array.isArray(data)
            ? data.map((entry) => normalizeLocalizedEntity<DndEquipmentRecord>(entry))
            : [];
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 500) throw new Error('Erro no servidor');
        return [];
    }
};
