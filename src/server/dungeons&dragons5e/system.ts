import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, dndBaseUrl } from '../wrapper';

export const getDnd5eClasses = async () => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: dndBaseUrl,
            endpoint: 'classes',
            method: 'GET',
        });

        return data;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 500) throw new Error('Erro no servidor');
        return [];
    }
};

export const getDnd5eRaces = async () => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: dndBaseUrl,
            endpoint: 'races',
            method: 'GET',
        });

        return data;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 500) throw new Error('Erro no servidor');
        return [];
    }
};

export const getDnd5eRaceById = async (raceId: string) => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: dndBaseUrl,
            endpoint: `races/${raceId}`,
            method: 'GET',
        });

        return data;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 500) throw new Error('Erro no servidor');
        return null;
    }
};

export const getDnd5eSpellsByLevel = async (level: number) => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: dndBaseUrl,
            endpoint: 'spells/by-level',
            method: 'GET',
            params: { queryLevel: level },
        });

        return data ?? [];
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 500) throw new Error('Erro no servidor');
        return [];
    }
};

export const getDnd5eSpellById = async (spellId: string) => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: dndBaseUrl,
            endpoint: `spells/${spellId}`,
            method: 'GET',
        });

        return data ?? null;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 500) throw new Error('Erro no servidor');
        return null;
    }
};

export const getDnd5eClassById = async (classId: string) => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: dndBaseUrl,
            endpoint: `classes/${classId}`,
            method: 'GET',
        });

        return data;
    } catch (error: AxiosError | any) {
        const status = error?.response?.status;
        if (status === 500) throw new Error('Erro no servidor');
        return null;
    }
};
