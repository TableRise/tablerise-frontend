'use client';

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TableriseContext from '@/context/TableriseContext';
import LoggedHeader from '@/components/common/LoggedHeader';
import LobbySideMenu from '@/components/lobby/LobbySideMenu';
import { getCampaignById, confirmPlayerPresence } from '@/server/campaigns/join-campaign';
import { getUser } from '@/server/users/get-user';
import CharacterSheetModal from '@/components/lobby/CharacterSheetModal';
import ParticipantsModal from '@/components/lobby/ParticipantsModal';
import JournalPostModal from '@/components/lobby/JournalPostModal';
import CreatePostModal from '@/components/lobby/CreatePostModal';
import EditCampaignModal from '@/components/lobby/EditCampaignModal';
import LeaveCampaignModal from '@/components/lobby/LeaveCampaignModal';
import ShopModal from '@/components/lobby/ShopModal';
import CampaignHistoryModal from '@/components/lobby/CampaignHistoryModal';
import {
    deleteCampaignJournalPost,
    getCampaignJournalPosts,
    getCampaignHighlightedJournalPost,
    type JournalPost,
} from '@/server/campaigns/get-journal-posts';
import {
    getCharactersByCampaignLobby,
    type CampaignCharacter,
} from '@/server/characters/get-characters';
import LobbyJournalSection from '@/app/campaigns/lobby/LobbyJournalSection';
import LobbyOverviewSection from '@/app/campaigns/lobby/LobbyOverviewSection';
import LoadingDots from '@/components/common/LoadingDots';
import {
    CATEGORY_LABEL,
    mapCampaignData,
    type CampaignData,
    type ConfirmedPlayerInfo,
} from '@/app/campaigns/lobby/lobbyPageHelpers';
import Footer from '@/components/common/Footer';
import { areJournalPostsEqual } from '@/utils/journalPosts';
import { getUserRank } from '@/utils/userRank';
import { getResolvedUserTitle } from '@/utils/userTitle';
import { useStoredUser } from '@/hooks/useStoredUser';
import { updateUserXp } from '@/server/users/update-user-xp';

const PLAY_MATCH_XP_REWARD = 200;
const PLAY_MATCH_XP_REWARD_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const PLAY_MATCH_XP_STORAGE_PREFIX = 'tablerise-play-match-xp';

type PlayMatchXpStorageRecord = {
    status: 'pending' | 'awarded';
    timestamp: number;
};

function getPlayMatchXpStorageKey(userId: string): string {
    return `${PLAY_MATCH_XP_STORAGE_PREFIX}:${userId}`;
}

function readPlayMatchXpStorage(userId: string): PlayMatchXpStorageRecord | null {
    try {
        const rawValue = window.localStorage.getItem(getPlayMatchXpStorageKey(userId));

        if (!rawValue) return null;

        const parsedValue = JSON.parse(rawValue) as PlayMatchXpStorageRecord;

        if (
            !parsedValue ||
            (parsedValue.status !== 'pending' && parsedValue.status !== 'awarded') ||
            typeof parsedValue.timestamp !== 'number' ||
            !Number.isFinite(parsedValue.timestamp)
        ) {
            window.localStorage.removeItem(getPlayMatchXpStorageKey(userId));
            return null;
        }

        return parsedValue;
    } catch {
        window.localStorage.removeItem(getPlayMatchXpStorageKey(userId));
        return null;
    }
}

function hasRecentPlayMatchXpReward(userId: string, now: number): boolean {
    const storedReward = readPlayMatchXpStorage(userId);

    if (!storedReward) return false;

    return now - storedReward.timestamp < PLAY_MATCH_XP_REWARD_INTERVAL_MS;
}

async function awardWeeklyPlayMatchXp(userId: string): Promise<void> {
    const now = Date.now();

    if (hasRecentPlayMatchXpReward(userId, now)) return;

    const storageKey = getPlayMatchXpStorageKey(userId);

    try {
        window.localStorage.setItem(
            storageKey,
            JSON.stringify({
                status: 'pending',
                timestamp: now,
            } satisfies PlayMatchXpStorageRecord)
        );

        await updateUserXp(userId, PLAY_MATCH_XP_REWARD);

        window.localStorage.setItem(
            storageKey,
            JSON.stringify({
                status: 'awarded',
                timestamp: now,
            } satisfies PlayMatchXpStorageRecord)
        );
    } catch {
        window.localStorage.removeItem(storageKey);
    }
}

export default function CampaignLobby(): JSX.Element {
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId') ?? '';
    const router = useRouter();
    const { themeMode, userCampaigns } = useContext(TableriseContext);
    const { storedUser: userInfo, hasResolvedStoredUser } = useStoredUser<{
        userId?: string;
        nickname?: string;
        username?: string;
    }>();
    const [campaign, setCampaign] = useState<CampaignData | null>(null);
    const [presenceConfirmed, setPresenceConfirmed] = useState(false);
    const [presenceSubmitting, setPresenceSubmitting] = useState(false);
    const [sessionPreviewOpen, setSessionPreviewOpen] = useState(false);
    const [campaignHistoryOpen, setCampaignHistoryOpen] = useState(false);
    const [confirmedPlayersInfo, setConfirmedPlayersInfo] = useState<
        ConfirmedPlayerInfo[]
    >([]);
    const [sheetModalOpen, setSheetModalOpen] = useState(false);
    const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
    const [editSettingsModalOpen, setEditSettingsModalOpen] = useState(false);
    const [leaveCampaignModalOpen, setLeaveCampaignModalOpen] = useState(false);
    const [shopModalOpen, setShopModalOpen] = useState(false);
    const [lobbyCharacters, setLobbyCharacters] = useState<CampaignCharacter[]>([]);
    const [characterAuthorRanksByUserId, setCharacterAuthorRanksByUserId] = useState<
        Record<string, string>
    >({});
    const [journalPosts, setJournalPosts] = useState<JournalPost[]>([]);
    const [highlightedJournalPost, setHighlightedJournalPost] =
        useState<JournalPost | null>(null);
    const [selectedPost, setSelectedPost] = useState<JournalPost | null>(null);
    const [editingPost, setEditingPost] = useState<JournalPost | null>(null);
    const [postDeleteSubmitting, setPostDeleteSubmitting] = useState(false);
    const [postActionError, setPostActionError] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    useEffect(() => {
        if (!campaignId) {
            router.push('/');
            return;
        }

        if (!hasResolvedStoredUser) {
            return;
        }

        if (!userInfo?.userId) {
            router.push('/');
            return;
        }

        const cached =
            userCampaigns.master.find((entry) => entry.campaignId === campaignId) ||
            userCampaigns.player.find((entry) => entry.campaignId === campaignId);

        if (cached) {
            setCampaign(mapCampaignData(cached));
        }

        getCampaignById(campaignId).then((data) => {
            if (!data) {
                router.push('/');
                return;
            }

            const isUserInCampaign = (data.campaignPlayers ?? []).some(
                (player: { userId: string }) => player.userId === userInfo.userId
            );

            if (!isUserInCampaign) {
                router.push('/');
                return;
            }

            setCampaign(mapCampaignData(data));
        });
    }, [campaignId, hasResolvedStoredUser, router, userCampaigns, userInfo?.userId]);

    useEffect(() => {
        if (!campaignId) return;
        getCharactersByCampaignLobby(campaignId).then(setLobbyCharacters);
    }, [campaignId]);

    const refreshCampaign = useCallback(async () => {
        if (!campaignId) return;
        const data = await getCampaignById(campaignId);
        if (data) setCampaign(mapCampaignData(data));
    }, [campaignId]);

    const refreshLobbyCharacters = useCallback(() => {
        if (!campaignId) return;
        getCharactersByCampaignLobby(campaignId).then(setLobbyCharacters);
    }, [campaignId]);

    const refreshJournalPosts = useCallback(async (): Promise<JournalPost[]> => {
        if (!campaignId) return [];
        const posts = await getCampaignJournalPosts(campaignId);
        setJournalPosts(posts);
        return posts;
    }, [campaignId]);

    const refreshHighlightedPost = useCallback(async (): Promise<JournalPost | null> => {
        if (!campaignId) return null;
        const post = await getCampaignHighlightedJournalPost(campaignId);
        setHighlightedJournalPost(post);
        return post;
    }, [campaignId]);

    useEffect(() => {
        if (!campaignId) return;
        refreshJournalPosts();
    }, [campaignId, refreshJournalPosts]);

    useEffect(() => {
        if (!campaign?.confirmedPlayers?.length) {
            setConfirmedPlayersInfo([]);
            return;
        }

        Promise.all(
            campaign.confirmedPlayers.map(async (entry) => {
                const confirmedUserId = entry.userId;

                try {
                    const user = await getUser(confirmedUserId);
                    const resolvedTitle = getResolvedUserTitle(user);
                    return {
                        userId: confirmedUserId,
                        name: user?.nickname ?? user?.username ?? confirmedUserId,
                        picture: user?.picture?.link ?? '/images/SideImageBackground.svg',
                        rank: getUserRank(user),
                        title: resolvedTitle.title,
                        titleType: resolvedTitle.titleType,
                    };
                } catch {
                    return {
                        userId: confirmedUserId,
                        name: confirmedUserId,
                        picture: '/images/SideImageBackground.svg',
                    };
                }
            })
        ).then(setConfirmedPlayersInfo);
    }, [campaign?.confirmedPlayers]);

    useEffect(() => {
        if (!lobbyCharacters.length) {
            setCharacterAuthorRanksByUserId({});
            return;
        }

        const authorIds = Array.from(
            new Set(
                lobbyCharacters
                    .map((character) => character.authorUserId)
                    .filter((authorUserId) => authorUserId.trim() !== '')
            )
        );

        Promise.all(
            authorIds.map(async (authorUserId) => {
                try {
                    const user = await getUser(authorUserId);
                    return [authorUserId, getUserRank(user) ?? ''] as const;
                } catch {
                    return [authorUserId, ''] as const;
                }
            })
        ).then((entries) => {
            setCharacterAuthorRanksByUserId(
                Object.fromEntries(entries.filter(([, rank]) => rank.trim() !== ''))
            );
        });
    }, [lobbyCharacters]);

    useEffect(() => {
        if (!campaign?.confirmedPlayers?.length || !userInfo?.userId) {
            setPresenceConfirmed(false);
            return;
        }

        setPresenceConfirmed(
            campaign.confirmedPlayers.some((entry) => entry.userId === userInfo.userId)
        );
    }, [campaign?.confirmedPlayers, userInfo?.userId]);

    const userRole = campaign?.campaignPlayers.find(
        (entry) => entry.userId === userInfo?.userId
    )?.role;
    const isMasterCampaign = userCampaigns.master.some(
        (entry) => entry.campaignId === campaignId
    );
    const isPlayer = userRole === 'player' || userRole === 'admin_player';
    const isMaster = userRole === 'dungeon_master' || isMasterCampaign;
    const isAdminPlayer = userRole === 'admin_player';
    const postFilters = Object.keys(CATEGORY_LABEL);
    const filteredPosts =
        activeFilter === 'all'
            ? journalPosts
            : journalPosts.filter((post) => post.category === activeFilter);
    const isSelectedPostAuthor =
        !!selectedPost?.author?.userId && selectedPost.author.userId === userInfo?.userId;
    const canDeleteSelectedPost =
        !!selectedPost && (isMaster || isAdminPlayer || isSelectedPostAuthor);
    const canEditSelectedPost = !!selectedPost && isSelectedPostAuthor;

    const handleCopyCampaignCode = useCallback(async () => {
        if (!campaign?.code) return;

        try {
            await navigator.clipboard.writeText(campaign.code);
        } catch {
            // silently ignore clipboard errors
        }
    }, [campaign?.code]);

    const handleDeleteSelectedPost = useCallback(async () => {
        if (!campaignId || !selectedPost || !userInfo?.userId || postDeleteSubmitting) {
            return;
        }

        setPostActionError('');
        setPostDeleteSubmitting(true);

        try {
            const deletedHighlightedPost = areJournalPostsEqual(
                highlightedJournalPost,
                selectedPost
            );

            await deleteCampaignJournalPost(campaignId, selectedPost, userInfo.userId);
            setJournalPosts((current) =>
                current.filter((post) => !areJournalPostsEqual(post, selectedPost))
            );
            setSelectedPost(null);
            setEditingPost(null);

            if (deletedHighlightedPost) {
                await refreshHighlightedPost();
            }
        } catch (error: any) {
            setPostActionError(error?.message ?? 'Erro ao excluir post.');
        } finally {
            setPostDeleteSubmitting(false);
        }
    }, [
        campaignId,
        highlightedJournalPost,
        postDeleteSubmitting,
        refreshHighlightedPost,
        selectedPost,
        userInfo?.userId,
    ]);

    const handleEditSelectedPost = useCallback(() => {
        if (!selectedPost) return;
        setPostActionError('');
        setEditingPost(selectedPost);
    }, [selectedPost]);

    const rollingTitles = useMemo(() => {
        const titles = journalPosts.map((post) => post.title);
        return titles.slice(0, 3);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [journalPosts]);

    if (!campaign) {
        return (
            <main>
                <LoggedHeader />
                <div className="lobby-loading">
                    <span className="font-M-semibold">
                        <LoadingDots label="Carregando campanha" />
                    </span>
                </div>
            </main>
        );
    }

    return (
        <main>
            <LoggedHeader />
            <div className="lobby-wrapper">
                <section className="lobby-content">
                    <LobbyOverviewSection
                        campaign={campaign}
                        themeMode={themeMode}
                        presenceConfirmed={presenceConfirmed}
                        presenceSubmitting={presenceSubmitting}
                        sessionPreviewOpen={sessionPreviewOpen}
                        campaignHistoryOpen={campaignHistoryOpen}
                        confirmedPlayersInfo={confirmedPlayersInfo}
                        lobbyCharacters={lobbyCharacters}
                        characterAuthorRanksByUserId={characterAuthorRanksByUserId}
                        onCopyCampaignCode={handleCopyCampaignCode}
                        onTogglePresence={async () => {
                            setPresenceSubmitting(true);
                            try {
                                await confirmPlayerPresence(
                                    campaignId,
                                    presenceConfirmed
                                );
                                await refreshCampaign();
                            } catch {
                                // silently ignore
                            } finally {
                                setPresenceSubmitting(false);
                            }
                        }}
                        onOpenSessionPreview={() => setSessionPreviewOpen(true)}
                        onCloseSessionPreview={() => setSessionPreviewOpen(false)}
                        onOpenCampaignHistory={() => setCampaignHistoryOpen(true)}
                        onCloseCampaignHistory={() => setCampaignHistoryOpen(false)}
                    />

                    <LobbyJournalSection
                        rollingTitles={rollingTitles}
                        postFilters={postFilters}
                        activeFilter={activeFilter}
                        filteredPosts={filteredPosts}
                        highlightedJournalPost={highlightedJournalPost}
                        onFilterChange={setActiveFilter}
                        onSelectPost={(post) => {
                            setPostActionError('');
                            setSelectedPost(post);
                        }}
                    />
                </section>

                <LobbySideMenu
                    isPlayer={isPlayer}
                    isMaster={isMaster}
                    shopEnabled={campaign.shopSystem}
                    playEnabled={campaign.playOn}
                    onMenuAction={(key) => {
                        if (key === 'play-match' && campaign.playOn) {
                            if (userInfo?.userId) {
                                void awardWeeklyPlayMatchXp(userInfo.userId);
                            }
                            router.push(`/campaigns/match?campaignId=${campaignId}`);
                        }
                        if (key === 'create-sheet') setSheetModalOpen(true);
                        if (key === 'participants') setParticipantsModalOpen(true);
                        if (key === 'history') setHistoryModalOpen(true);
                        if (key === 'new-post') setCreatePostModalOpen(true);
                        if (key === 'edit-settings') setEditSettingsModalOpen(true);
                        if (key === 'leave') setLeaveCampaignModalOpen(true);
                        if (key === 'shop' && campaign.shopSystem) setShopModalOpen(true);
                    }}
                />
            </div>

            {createPostModalOpen ? (
                <CreatePostModal
                    campaignId={campaign.campaignId}
                    userRole={userRole}
                    onClose={() => setCreatePostModalOpen(false)}
                    onCreated={() => refreshJournalPosts()}
                />
            ) : null}

            {editingPost ? (
                <CreatePostModal
                    campaignId={campaign.campaignId}
                    userId={userInfo?.userId ?? ''}
                    userRole={userRole}
                    mode="edit"
                    initialPost={editingPost}
                    onClose={() => setEditingPost(null)}
                    onCreated={async () => {
                        const posts = await refreshJournalPosts();
                        const nextSelectedPost =
                            posts.find((post) => post.postId === editingPost.postId) ??
                            null;

                        setSelectedPost(nextSelectedPost);
                        setEditingPost(null);

                        if (
                            highlightedJournalPost &&
                            areJournalPostsEqual(highlightedJournalPost, editingPost)
                        ) {
                            await refreshHighlightedPost();
                        }
                    }}
                />
            ) : null}

            {selectedPost && !editingPost ? (
                <JournalPostModal
                    post={selectedPost}
                    canDelete={canDeleteSelectedPost}
                    canEdit={canEditSelectedPost}
                    isDeleting={postDeleteSubmitting}
                    actionError={postActionError}
                    onDelete={handleDeleteSelectedPost}
                    onEdit={handleEditSelectedPost}
                    onClose={() => {
                        setPostActionError('');
                        setSelectedPost(null);
                    }}
                />
            ) : null}

            {participantsModalOpen ? (
                <ParticipantsModal
                    campaignId={campaign.campaignId}
                    isMaster={isMaster}
                    currentUserId={userInfo?.userId ?? ''}
                    onParticipantsChanged={async () => {
                        refreshCampaign();
                        refreshLobbyCharacters();
                    }}
                    onClose={() => setParticipantsModalOpen(false)}
                />
            ) : null}

            {historyModalOpen ? (
                <CampaignHistoryModal
                    logs={campaign.logs}
                    onClose={() => setHistoryModalOpen(false)}
                />
            ) : null}

            {sheetModalOpen ? (
                <CharacterSheetModal
                    campaignId={campaign.campaignId}
                    userId={userInfo?.userId ?? ''}
                    isPlayer={isPlayer}
                    isMaster={isMaster}
                    xpSystem={campaign.xpSystem}
                    onClose={() => setSheetModalOpen(false)}
                />
            ) : null}

            {leaveCampaignModalOpen ? (
                <LeaveCampaignModal
                    campaignId={campaign.campaignId}
                    isMaster={isMaster}
                    onClose={() => setLeaveCampaignModalOpen(false)}
                />
            ) : null}

            {shopModalOpen ? (
                <ShopModal
                    campaignId={campaignId}
                    userId={userInfo?.userId ?? ''}
                    userNickname={userInfo?.nickname ?? userInfo?.username ?? ''}
                    lobbyCharacters={lobbyCharacters}
                    buys={campaign.buys}
                    isMaster={isMaster}
                    isAdminPlayer={isAdminPlayer}
                    refreshCampaign={refreshCampaign}
                    onClose={() => setShopModalOpen(false)}
                />
            ) : null}

            {editSettingsModalOpen ? (
                <EditCampaignModal
                    campaignId={campaign.campaignId}
                    initialData={{
                        title: campaign.title,
                        description: campaign.description,
                        mainHistory: campaign.mainHistory,
                        nextMatchDate: campaign.nextMatchDate,
                        socialMedia: campaign.socialMedia,
                        nextSessionResume: campaign.nextSessionResume,
                        visibility: campaign.visibility,
                        ageRestriction: campaign.ageRestriction,
                        playerAmountLimit: campaign.playerAmountLimit,
                        shopOn: campaign.shopSystem,
                        playOn: campaign.playOn,
                        adminId:
                            campaign.campaignPlayers.find(
                                (entry) => entry.role === 'admin_player'
                            )?.userId ?? '',
                        cover: campaign.cover?.link ?? '',
                        mapImages: campaign.mapImages?.map((image) => image.link) ?? [],
                        musics: campaign.musics ?? [],
                    }}
                    onClose={() => setEditSettingsModalOpen(false)}
                    onSaved={refreshCampaign}
                />
            ) : null}

            <Footer />
        </main>
    );
}
