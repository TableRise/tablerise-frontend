import { ImageObject } from '@/types/shared/general';

interface CampaignPlayer {
    userId: string;
    userId_sk: string;
    userId_pk: string;
    role: string;
}

interface UserCampaign {
    campaignId: string;
    title: string;
    cover: ImageObject;
    description: string;
    system: string;
    ageRestriction: string;
    visibility: string;
    campaignPlayers: CampaignPlayer[];
    infos: {
        nextMatchDate: string;
        playerAmountLimit?: number;
        socialMedia?: { discord?: string; twitter?: string; youtube?: string };
        nextSessionResume?: string;
    };
    matchData?: {
        confirmedPlayers?: string[];
        mapImages?: { link: string }[];
        nextSessionResume?: string;
    };
    musics?: { id: string; title: string; thumbnail: string }[];
}

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
