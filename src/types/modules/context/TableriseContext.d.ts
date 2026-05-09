import type { ImageObject } from '@/types/shared/general';
import type { DatabaseCampaign, DatabaseCampaignPlayer } from '@/types/shared/entities';

export type CampaignPlayer = DatabaseCampaignPlayer & {
    userId_sk?: string;
    userId_pk?: string;
};

export type UserCampaign = Omit<
    Pick<
        DatabaseCampaign,
        | 'campaignId'
        | 'title'
        | 'description'
        | 'mainHistory'
        | 'system'
        | 'ageRestriction'
        | 'musics'
    >,
    'campaignPlayers' | 'cover'
> & {
    campaignId: string;
    cover: ImageObject;
    visibility: DatabaseCampaign['infos']['visibility'];
    campaignPlayers: CampaignPlayer[];
    infos: {
        nextMatchDate: DatabaseCampaign['infos']['nextMatchDate'];
        playerAmountLimit?: DatabaseCampaign['infos']['playerAmountLimit'];
        socialMedia?: DatabaseCampaign['infos']['socialMedia'];
        nextSessionResume?: DatabaseCampaign['matchData']['nextSessionResume'];
    };
    matchData?: {
        confirmedPlayers?: Array<string | Pick<CampaignPlayer, 'userId' | 'role'>>;
        mapImages?: ImageObject[];
        nextSessionResume?: DatabaseCampaign['matchData']['nextSessionResume'];
    };
    musics?: DatabaseCampaign['musics'];
};

export interface UserCampaignsContract {
    master: UserCampaign[];
    player: UserCampaign[];
}
export interface TableriseContextContract {
    loading: boolean;
    newPassVisible: boolean;
    darkModeOn: boolean;
    userLoggedToggle: number;
    userCampaigns: UserCampaignsContract;
    setLoading: (boolean: boolean) => void;
    setNewPassVisible: (boolean: boolean) => void;
    setDarkModeOn: (boolean: boolean) => void;
    setUserCampaigns: (data: UserCampaignsContract) => void;
    recoverUserCampaigns: () => Promise<void>;
}
