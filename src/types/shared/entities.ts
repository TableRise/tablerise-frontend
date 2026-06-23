import type User from '@tablerise/database-management/dist/src/interfaces/User';
import type { UserDetail } from '@tablerise/database-management/dist/src/interfaces/User';
import type Campaign from '@tablerise/database-management/dist/src/interfaces/Campaigns';
import type {
    Infos as CampaignInfos,
    MatchData,
    Music as CampaignMusicEntity,
    Player as CampaignPlayer,
} from '@tablerise/database-management/dist/src/interfaces/Campaigns';
import type {
    CharactersDnd,
    Author as CharacterAuthor,
    Data as CharacterData,
    Profile as CharacterProfile,
    Stats as CharacterStats,
    AbilityScore as CharacterAbilityScore,
} from '@tablerise/database-management/dist/src/interfaces/CharactersDnd';
import type {
    ImageObject as CommonImageObject,
    Logs as CommonLog,
} from '@tablerise/database-management/dist/src/interfaces/Common';

export type DatabaseUser = User;
export type DatabaseUserDetail = Omit<UserDetail, 'gameInfo'> & {
    level?: number;
    xp?: number;
    title?: string;
    gender?: 'male' | 'female';
    gameInfo: Omit<UserDetail['gameInfo'], 'campaigns'> & {
        campaigns: string[];
    };
};
export type DatabaseUserCampaignInfo = string;
export type DatabaseUserWithDetails = DatabaseUser & {
    username?: string;
    details?: DatabaseUserDetail;
    result?: {
        details?: DatabaseUserDetail;
    };
};

export interface DatabaseCampaignBuyRecord {
    name: string;
    cost: string;
    character: string;
    user: string;
    date: string;
}

export type DatabaseCampaign = Campaign & {
    buys?: DatabaseCampaignBuyRecord[];
};
export type DatabaseCampaignInfos = CampaignInfos;
export type DatabaseCampaignPlayer = CampaignPlayer;
export type DatabaseCampaignMatchData = MatchData;
export type DatabaseCampaignMusic = CampaignMusicEntity;
export type DatabaseCampaignGroupsResponse = {
    master: DatabaseCampaign[];
    player: DatabaseCampaign[];
};

export type DatabaseCharacter = CharactersDnd;
export type DatabaseCharacterAuthor = CharacterAuthor;
export type DatabaseCharacterData = CharacterData;
export type DatabaseCharacterProfile = CharacterProfile;
export type DatabaseCharacterStats = CharacterStats;
export type DatabaseCharacterAbilityScore = CharacterAbilityScore;

export type DatabaseImageObject = CommonImageObject;
export type DatabaseLog = CommonLog;
