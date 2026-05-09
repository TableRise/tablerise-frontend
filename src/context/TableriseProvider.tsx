'use client';
import { useMemo, useState, useEffect, useCallback } from 'react';
import TableriseContext from '@/context/TableriseContext';
import { UserCampaignsContract } from '@/types/modules/context/TableriseContext';
import { getCampaignsByUserId } from '@/server/campaigns/get-campaigns';
import type { DatabaseCampaign } from '@/types/shared/entities';

export default function TableriseProvider({
    children,
    userLogged,
}: Readonly<{
    children: React.ReactNode;
    userLogged: number;
}>) {
    const [loading, setLoading] = useState(false);
    const [newPassVisible, setNewPassVisible] = useState(false);
    const [darkModeOn, setDarkModeOn] = useState(false);
    const [userCampaigns, setUserCampaigns] = useState<UserCampaignsContract>({
        master: [],
        player: [],
    } as UserCampaignsContract);
    const [userLoggedToggle] = useState(userLogged);

    const recoverUserCampaigns = useCallback(async () => {
        const userInfos = JSON.parse(localStorage.getItem('userLogged') as string);

        if (userInfos) {
            const userCampaigns = await getCampaignsByUserId(userInfos.userId);

            if (!userCampaigns) return;

            const userCampaignsHomeData = {
                master: [],
                player: [],
            } as UserCampaignsContract;

            userCampaigns.master.forEach((campaign: DatabaseCampaign) => {
                userCampaignsHomeData.master.push({
                    campaignId: campaign.campaignId ?? '',
                    title: campaign.title,
                    cover: campaign.cover,
                    description: campaign.description,
                    mainHistory: campaign.mainHistory ?? '',
                    system: campaign.system,
                    ageRestriction: campaign.ageRestriction,
                    visibility: campaign.infos.visibility,
                    campaignPlayers: campaign.campaignPlayers ?? [],
                    infos: {
                        nextMatchDate: campaign.infos.nextMatchDate,
                        playerAmountLimit: campaign.infos.playerAmountLimit,
                        socialMedia: campaign.infos.socialMedia ?? {},
                        nextSessionResume: campaign.matchData?.nextSessionResume ?? '',
                    },
                    matchData: {
                        confirmedPlayers: campaign.matchData?.confirmedPlayers ?? [],
                        mapImages: campaign.matchData?.mapImages ?? [],
                        nextSessionResume: campaign.matchData?.nextSessionResume ?? '',
                    },
                    musics: campaign.musics ?? [],
                });
            });

            userCampaigns.player.forEach((campaign: DatabaseCampaign) => {
                userCampaignsHomeData.player.push({
                    campaignId: campaign.campaignId ?? '',
                    title: campaign.title,
                    cover: campaign.cover,
                    description: campaign.description,
                    mainHistory: campaign.mainHistory ?? '',
                    system: campaign.system,
                    ageRestriction: campaign.ageRestriction,
                    visibility: campaign.infos.visibility,
                    campaignPlayers: campaign.campaignPlayers ?? [],
                    infos: {
                        nextMatchDate: campaign.infos.nextMatchDate,
                        playerAmountLimit: campaign.infos.playerAmountLimit,
                        socialMedia: campaign.infos.socialMedia ?? {},
                        nextSessionResume: campaign.matchData?.nextSessionResume ?? '',
                    },
                    matchData: {
                        confirmedPlayers: campaign.matchData?.confirmedPlayers ?? [],
                        mapImages: campaign.matchData?.mapImages ?? [],
                        nextSessionResume: campaign.matchData?.nextSessionResume ?? '',
                    },
                    musics: campaign.musics ?? [],
                });
            });

            setUserCampaigns(userCampaignsHomeData);
        }
    }, [setUserCampaigns]);

    useEffect(() => {
        async function handleUserCampaigns() {
            if (userLoggedToggle === 1) {
                await recoverUserCampaigns();
            }
        }

        handleUserCampaigns();
    }, [recoverUserCampaigns, userLoggedToggle]);

    const value = useMemo(
        () => ({
            loading,
            newPassVisible,
            darkModeOn,
            userLoggedToggle,
            userCampaigns,
            setLoading,
            setNewPassVisible,
            setDarkModeOn,
            setUserCampaigns,
            recoverUserCampaigns,
        }),
        [
            loading,
            newPassVisible,
            darkModeOn,
            userLoggedToggle,
            userCampaigns,
            recoverUserCampaigns,
        ]
    );

    return (
        <TableriseContext.Provider value={value}>{children}</TableriseContext.Provider>
    );
}
