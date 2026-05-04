import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, charactersBaseUrl, campaignsBaseUrl } from '../wrapper';

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

export interface CampaignCharacter {
    id: string;
    name: string;
    image: string;
    authorUserId: string;
    createdAt: string;
    updatedAt: string;
}

export interface FullCharacterDnd {
    characterId: string;
    author: CharacterAuthor;
    npc: boolean;
    createdAt: string;
    updatedAt: string;
    data: {
        profile: {
            name: string;
            class: string;
            race: string;
            level: number;
            xp: number;
            characteristics: {
                alignment?: string;
                backstory?: string;
                personalityTraits?: string;
                ideals?: string;
                bonds?: string;
                flaws?: string;
                appearance?: {
                    age?: string;
                    height?: string;
                    weight?: string;
                    eyes?: string;
                    skin?: string;
                    hair?: string;
                    picture?: {
                        link: string;
                    };
                };
                alliesAndOrgs?: string;
                treasure?: string;
                other?: { proficiencies?: string; extraCharacteristics?: string };
            };
        };
        stats: {
            abilityScores: {
                ability: string;
                value: number;
                modifier: number;
                proficiency: boolean;
            }[];
            skills: Record<string, number>;
            proficiencyBonus: number;
            inspiration: number;
            passiveWisdom: number;
            speed: number;
            initiative: number;
            armorClass: number;
            hitPoints: {
                points: number;
                currentPoints: number;
                tempPoints: number;
                dicePoints: string;
            };
            deathSaves: { success: number; failures: number };
            spellCasting?: {
                class?: string;
                ability?: string;
                saveDc?: number;
                attackBonus?: number;
            };
        };
        attacks: { name: string; atkBonus: string; damage: string }[];
        equipments?: string;
        money?: { cp: number; sp: number; ep: number; gp: number; pp: number };
        features?: string;
        spells?: any;
        extraAbilities?: any;
    };
}

export const getCharacterById = async (
    characterId: string
): Promise<FullCharacterDnd | null> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: charactersBaseUrl,
            endpoint: characterId,
            method: 'GET',
        });
        return data;
    } catch {
        return null;
    }
};

function mapCampaignCharacter(result: any): CampaignCharacter {
    return {
        id: result.characterId,
        name: result.data?.profile?.name ?? result.profile?.name ?? 'Sem nome',
        image:
            result.data?.profile?.characteristics?.appearance?.picture?.link ??
            result.profile?.characteristics?.appearance?.picture?.link ??
            result.picture?.link ??
            '',
        authorUserId: result.author?.userId ?? '',
        createdAt: result.data?.createdAt ?? result.createdAt ?? '',
        updatedAt: result.data?.updatedAt ?? result.updatedAt ?? '',
    };
}

export const getCharactersByCampaignLobby = async (
    campaignId: string
): Promise<CampaignCharacter[]> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/characters`,
            method: 'GET',
        });
        const list = Array.isArray(data) ? data : [];
        return list.map(mapCampaignCharacter);
    } catch {
        return [];
    }
};

export const getCharactersByPlayer = async (
    campaignId: string
): Promise<CampaignCharacter[]> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: campaignsBaseUrl,
            endpoint: `${campaignId}/characters-by-player`,
            method: 'GET',
        });
        const list = Array.isArray(data) ? data : [];
        return list.map(mapCampaignCharacter);
    } catch {
        return [];
    }
};
