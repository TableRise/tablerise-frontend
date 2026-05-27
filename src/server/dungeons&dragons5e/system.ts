import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, dndBaseUrl } from '../wrapper';
import type {
    Class as DatabaseDndClass,
    Race as DatabaseDndRace,
} from '@tablerise/database-management/dist/src/interfaces/DungeonsAndDragons5e';

export type DndClassRecord = DatabaseDndClass & { classId: string };
export type DndRaceRecord = DatabaseDndRace & { raceId: string };
export type DndSpellRecord = {
    active: boolean;
    spellId: string;
    name: string;
    description: string;
    type: string;
    class: string[];
    level: number;
    higherLevels: string;
    castingTime: string;
    duration: string;
    range: string;
    components: string;
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

export const getDnd5eClasses = async (): Promise<DndClassRecord[]> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: dndBaseUrl,
            endpoint: 'classes',
            method: 'GET',
        });

        return Array.isArray(data)
            ? data.map((entry) => normalizeLocalizedEntity<DndClassRecord>(entry))
            : [];
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 500) throw new Error('Erro no servidor');
        return [];
    }
};

export const getDnd5eRaces = async (): Promise<DndRaceRecord[]> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: dndBaseUrl,
            endpoint: 'races',
            method: 'GET',
        });

        return Array.isArray(data)
            ? data.map((entry) => normalizeLocalizedEntity<DndRaceRecord>(entry))
            : [];
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 500) throw new Error('Erro no servidor');
        return [];
    }
};

export const getDnd5eRaceById = async (raceId: string): Promise<DndRaceRecord | null> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: dndBaseUrl,
            endpoint: `races/${raceId}`,
            method: 'GET',
        });

        return normalizeLocalizedEntity<DndRaceRecord>(data);
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 500) throw new Error('Erro no servidor');
        return null;
    }
};

export const getDnd5eSpellsByLevel = async (level: number): Promise<DndSpellRecord[]> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: dndBaseUrl,
            endpoint: 'spells/by-level',
            method: 'GET',
            params: { queryLevel: level },
        });

        return Array.isArray(data)
            ? data.map((entry) => normalizeLocalizedEntity<DndSpellRecord>(entry))
            : [];
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 500) throw new Error('Erro no servidor');
        return [];
    }
};

export const getDnd5eSpellById = async (
    spellId: string
): Promise<DndSpellRecord | null> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: dndBaseUrl,
            endpoint: `spells/${spellId}`,
            method: 'GET',
        });

        return data ? normalizeLocalizedEntity<DndSpellRecord>(data) : null;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 500) throw new Error('Erro no servidor');
        return null;
    }
};

export const getDnd5eClassById = async (
    classId: string
): Promise<DndClassRecord | null> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: dndBaseUrl,
            endpoint: `classes/${classId}`,
            method: 'GET',
        });

        return normalizeLocalizedEntity<DndClassRecord>(data);
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 500) throw new Error('Erro no servidor');
        return null;
    }
};
