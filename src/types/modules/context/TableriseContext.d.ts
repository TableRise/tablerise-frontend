import { ImageObject } from '@/types/shared/general';

interface UserCampaign {
    campaignId: string;
    title: string;
    cover: ImageObject;
    description: string;
    infos: {
        nextMatchDate: string;
    };
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
}
