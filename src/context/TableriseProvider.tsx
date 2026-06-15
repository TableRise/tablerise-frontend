'use client';
import { useMemo, useState, useEffect, useCallback } from 'react';
import TableriseContext from '@/context/TableriseContext';
import { UserCampaignsContract } from '@/types/modules/context/TableriseContext';
import { getCampaignsByUserId } from '@/server/campaigns/get-campaigns';
import type { DatabaseCampaign } from '@/types/shared/entities';
import {
    DEFAULT_THEME_MODE,
    isThemeMode,
    THEME_STORAGE_KEY,
    ThemeMode,
    updateDocumentTheme,
} from '@/utils/theme';

export default function TableriseProvider({
    children,
    userLogged,
}: Readonly<{
    children: React.ReactNode;
    userLogged: number;
}>) {
    const [loading, setLoading] = useState(false);
    const [newPassVisible, setNewPassVisible] = useState(false);
    const [themeMode, setThemeMode] = useState<ThemeMode>(DEFAULT_THEME_MODE);
    const [userCampaigns, setUserCampaigns] = useState<UserCampaignsContract>({
        master: [],
        player: [],
    } as UserCampaignsContract);
    const [userCampaignsLoading, setUserCampaignsLoading] = useState(userLogged === 1);
    const [userLoggedToggle] = useState(userLogged);

    const recoverUserCampaigns = useCallback(async () => {
        const userInfos = JSON.parse(localStorage.getItem('userLogged') as string);

        if (!userInfos) {
            setUserCampaignsLoading(false);
            return;
        }

        setUserCampaignsLoading(true);

        try {
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
                    buys: campaign.buys ?? [],
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
                    buys: campaign.buys ?? [],
                    matchData: {
                        confirmedPlayers: campaign.matchData?.confirmedPlayers ?? [],
                        mapImages: campaign.matchData?.mapImages ?? [],
                        nextSessionResume: campaign.matchData?.nextSessionResume ?? '',
                    },
                    musics: campaign.musics ?? [],
                });
            });

            setUserCampaigns(userCampaignsHomeData);
        } finally {
            setUserCampaignsLoading(false);
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

    useEffect(() => {
        const rootThemeMode = document.documentElement.dataset.theme;
        const storedThemeMode = localStorage.getItem(THEME_STORAGE_KEY);
        const systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const resolvedThemeMode = isThemeMode(rootThemeMode)
            ? rootThemeMode
            : isThemeMode(storedThemeMode)
            ? storedThemeMode
            : systemMediaQuery.matches
            ? 'dark'
            : 'light';

        setThemeMode(resolvedThemeMode);
        updateDocumentTheme(resolvedThemeMode);

        function handleSystemThemeChange(event: MediaQueryListEvent) {
            const explicitThemeMode = localStorage.getItem(THEME_STORAGE_KEY);

            if (isThemeMode(explicitThemeMode)) return;

            const nextThemeMode: ThemeMode = event.matches ? 'dark' : 'light';
            setThemeMode(nextThemeMode);
            updateDocumentTheme(nextThemeMode);
        }

        systemMediaQuery.addEventListener('change', handleSystemThemeChange);

        return () => {
            systemMediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, []);

    const toggleThemeMode = useCallback(() => {
        setThemeMode((currentThemeMode) => {
            const nextThemeMode: ThemeMode =
                currentThemeMode === 'dark' ? 'light' : 'dark';

            localStorage.setItem(THEME_STORAGE_KEY, nextThemeMode);
            updateDocumentTheme(nextThemeMode);

            return nextThemeMode;
        });
    }, []);

    const value = useMemo(
        () => ({
            loading,
            newPassVisible,
            themeMode,
            userLoggedToggle,
            userCampaigns,
            userCampaignsLoading,
            setLoading,
            setNewPassVisible,
            toggleThemeMode,
            setUserCampaigns,
            recoverUserCampaigns,
        }),
        [
            loading,
            newPassVisible,
            themeMode,
            userLoggedToggle,
            userCampaigns,
            userCampaignsLoading,
            recoverUserCampaigns,
            toggleThemeMode,
        ]
    );

    return (
        <TableriseContext.Provider value={value}>{children}</TableriseContext.Provider>
    );
}
