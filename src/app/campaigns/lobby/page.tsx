'use client';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import TableriseContext from '@/context/TableriseContext';
import LoggedHeader from '@/components/common/LoggedHeader';
import LobbySideMenu from '@/components/lobby/LobbySideMenu';
import { getCampaignById, confirmPlayerPresence } from '@/server/campaigns/join-campaign';
import { getUser } from '@/server/users/get-user';
import formatDate from '@/utils/formatDate';
import CharacterSheetModal from '@/components/lobby/CharacterSheetModal';
import ParticipantsModal from '@/components/lobby/ParticipantsModal';
import JournalPostModal from '@/components/lobby/JournalPostModal';
import CreatePostModal from '@/components/lobby/CreatePostModal';
import EditCampaignModal from '@/components/lobby/EditCampaignModal';
import LeaveCampaignModal from '@/components/lobby/LeaveCampaignModal';
import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import {
    deleteCampaignJournalPost,
    getCampaignJournalPosts,
    getCampaignHighlightedJournalPost,
    type JournalPost,
} from '@/server/campaigns/get-journal-posts';
import {
    disconnectCampaignSocket,
    emitCampaignSocketAck,
    getCampaignSocket,
} from '@/utils/campaignSocket';
import type {
    CampaignSyncPayload,
    SocketJournal,
    SocketPlayer,
    SocketPresenceUser,
} from '@/types/shared/socket';
import {
    getCharactersByCampaignLobby,
    type CampaignCharacter,
} from '@/server/characters/get-characters';
import type { ImageObject } from '@/types/shared/general';
import '@/app/campaigns/lobby/page.css';
import Footer from '@/components/common/Footer';

interface CampaignData {
    campaignId: string;
    title: string;
    cover: { link: string };
    description: string;
    mainHistory: string;
    system: string;
    campaignPlayers: SocketPlayer[];
    nextMatchDate: string;
    socialMedia: { discord?: string; twitter?: string; youtube?: string };
    confirmedPlayers: SocketPresenceUser[];
    visibility: string;
    ageRestriction: string;
    nextSessionResume: string;
    playerAmountLimit: number;
    mapImages: ImageObject[];
    musics: CampaignMusic[];
}

interface ConfirmedPlayerInfo {
    userId: string;
    name: string;
    picture: string;
}

function normalizeHighlightedJournalPostPayload(payload: {
    highlightedJournalPost?: JournalPost | null;
}): JournalPost | null {
    return payload.highlightedJournalPost ?? null;
}

function normalizeConfirmedPlayers(
    entries: Array<string | { userId: string; role?: string }> | undefined
): SocketPresenceUser[] {
    return (entries ?? [])
        .map((entry) => {
            if (typeof entry === 'string') {
                return { userId: entry };
            }

            return {
                userId: entry.userId,
                role: entry.role as SocketPresenceUser['role'],
            };
        })
        .filter((entry) => Boolean(entry.userId));
}

function areJournalPostsEqual(
    first: JournalPost | null,
    second: JournalPost | null
): boolean {
    if (!first || !second) return false;

    if (first.postId && second.postId) {
        return first.postId === second.postId;
    }

    return (
        first.title === second.title &&
        first.timestamp === second.timestamp &&
        first.category === second.category &&
        first.content === second.content
    );
}

function mapCampaignData(data: any): CampaignData {
    return {
        campaignId: data.campaignId,
        title: data.title,
        cover: { link: data.cover?.link },
        description: data.description,
        mainHistory: data.mainHistory ?? '',
        system: data.system,
        campaignPlayers: (data.campaignPlayers ?? []) as SocketPlayer[],
        nextMatchDate: data.infos?.nextMatchDate ?? '',
        socialMedia: data.infos?.socialMedia ?? {},
        confirmedPlayers: normalizeConfirmedPlayers(data.matchData?.confirmedPlayers),
        mapImages: data.matchData?.mapImages ?? [],
        musics: data.musics ?? [],
        visibility: data.visibility ?? '',
        ageRestriction: data.ageRestriction ?? '',
        nextSessionResume: data.matchData?.nextSessionResume ?? '',
        playerAmountLimit: data.infos?.playerAmountLimit ?? 1,
    };
}

export default function CampaignLobby(): JSX.Element {
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId') ?? '';
    const router = useRouter();
    const { userCampaigns } = useContext(TableriseContext);
    const [campaign, setCampaign] = useState<CampaignData | null>(null);
    const [presenceConfirmed, setPresenceConfirmed] = useState(false);
    const [sessionPreviewOpen, setSessionPreviewOpen] = useState(false);
    const [campaignHistoryOpen, setCampaignHistoryOpen] = useState(false);
    const [confirmedPlayersInfo, setConfirmedPlayersInfo] = useState<
        ConfirmedPlayerInfo[]
    >([]);
    const [sheetModalOpen, setSheetModalOpen] = useState(false);
    const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
    const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
    const [editSettingsModalOpen, setEditSettingsModalOpen] = useState(false);
    const [leaveCampaignModalOpen, setLeaveCampaignModalOpen] = useState(false);
    const [lobbyCharacters, setLobbyCharacters] = useState<CampaignCharacter[]>([]);
    const [journalPosts, setJournalPosts] = useState<JournalPost[]>([]);
    const [highlightedJournalPost, setHighlightedJournalPost] =
        useState<JournalPost | null>(null);
    const [selectedPost, setSelectedPost] = useState<JournalPost | null>(null);
    const [editingPost, setEditingPost] = useState<JournalPost | null>(null);
    const [postDeleteSubmitting, setPostDeleteSubmitting] = useState(false);
    const [postActionError, setPostActionError] = useState('');
    const userInfo =
        typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('userLogged') as string)
            : null;

    const reportSocketIssue = (_message: string) => undefined;

    useEffect(() => {
        if (!campaignId) {
            router.push('/');
            return;
        }

        if (!userInfo?.userId) {
            router.push('/');
            return;
        }

        const cached =
            userCampaigns.master.find((c) => c.campaignId === campaignId) ||
            userCampaigns.player.find((c) => c.campaignId === campaignId);

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
    }, [campaignId, router, userCampaigns, userInfo?.userId]);

    useEffect(() => {
        if (!campaignId) return;
        getCharactersByCampaignLobby(campaignId).then(setLobbyCharacters);
    }, [campaignId]);

    const refreshCampaign = useCallback(() => {
        if (!campaignId) return;
        getCampaignById(campaignId).then((data) => {
            if (data) setCampaign(mapCampaignData(data));
        });
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
                const userId = entry.userId;
                try {
                    const user = await getUser(userId);
                    return {
                        userId,
                        name: user?.nickname ?? user?.username ?? userId,
                        picture: user?.picture?.link ?? '/images/SideImageBackground.svg',
                    };
                } catch {
                    return {
                        userId,
                        name: userId,
                        picture: '/images/SideImageBackground.svg',
                    };
                }
            })
        ).then(setConfirmedPlayersInfo);
    }, [campaign?.confirmedPlayers]);

    useEffect(() => {
        if (!campaignId || !userInfo?.userId) return;

        const socket = getCampaignSocket();

        const handleCampaignSync = (payload: CampaignSyncPayload) => {
            if (payload.campaignId !== campaignId) return;

            setCampaign((current) =>
                current
                    ? {
                          ...current,
                          confirmedPlayers: payload.presence.confirmedPlayers,
                      }
                    : current
            );
            setHighlightedJournalPost(
                normalizeHighlightedJournalPostPayload(payload.match)
            );
        };

        const handlePresenceJoined = (
            payload: SocketPresenceUser & { campaignId?: string }
        ) => {
            if (
                (payload as any).campaignId &&
                (payload as any).campaignId !== campaignId
            ) {
                return;
            }
        };

        const handlePresenceLeft = (
            payload: SocketPresenceUser & { campaignId?: string }
        ) => {
            if (
                (payload as any).campaignId &&
                (payload as any).campaignId !== campaignId
            ) {
                return;
            }
        };

        const handleConfirmedPlayersUpdated = (payload: {
            campaignId: string;
            confirmedPlayers: SocketPresenceUser[];
        }) => {
            if (payload.campaignId !== campaignId) return;

            setCampaign((current) =>
                current
                    ? { ...current, confirmedPlayers: payload.confirmedPlayers }
                    : current
            );
        };

        const handleJournalPostCreated = (payload: {
            campaignId: string;
            post: SocketJournal;
        }) => {
            if (payload.campaignId !== campaignId) return;

            setJournalPosts((current) =>
                current.some(
                    (post) =>
                        post.title === payload.post.title &&
                        (post.postId
                            ? post.postId === payload.post.postId
                            : post.timestamp === payload.post.timestamp)
                )
                    ? current
                    : [payload.post, ...current]
            );
        };

        const handleHighlightChanged = (payload: {
            campaignId: string;
            highlightedJournalPost?: SocketJournal | null;
        }) => {
            if (payload.campaignId !== campaignId) return;
            setHighlightedJournalPost(normalizeHighlightedJournalPostPayload(payload));
        };

        const handlePlayerJoined = (payload: {
            campaignId: string;
            player: SocketPlayer;
        }) => {
            if (payload.campaignId !== campaignId) return;

            setCampaign((current) =>
                current
                    ? {
                          ...current,
                          campaignPlayers: current.campaignPlayers.some(
                              (player) => player.userId === payload.player.userId
                          )
                              ? current.campaignPlayers.map((player) =>
                                    player.userId === payload.player.userId
                                        ? payload.player
                                        : player
                                )
                              : [...current.campaignPlayers, payload.player],
                      }
                    : current
            );
        };

        const handlePlayerLeft = (payload: { campaignId: string; userId: string }) => {
            if (payload.campaignId !== campaignId) return;

            setCampaign((current) =>
                current
                    ? {
                          ...current,
                          campaignPlayers: current.campaignPlayers.filter(
                              (player) => player.userId !== payload.userId
                          ),
                      }
                    : current
            );
        };

        const handleMapsUpdated = (payload: {
            campaignId: string;
            mapImages: ImageObject[];
        }) => {
            if (payload.campaignId !== campaignId) return;

            setCampaign((current) =>
                current ? { ...current, mapImages: payload.mapImages } : current
            );
        };

        const handleMusicsUpdated = (payload: {
            campaignId: string;
            musics: CampaignMusic[];
        }) => {
            if (payload.campaignId !== campaignId) return;

            setCampaign((current) =>
                current ? { ...current, musics: payload.musics } : current
            );
        };

        const handleSettingsUpdated = (payload: {
            campaignId: string;
            title?: string;
            description?: string;
            mainHistory?: string | null;
            visibility?: string;
            ageRestriction?: string;
            nextMatchDate?: string | null;
            nextSessionResume?: string | null;
            playerAmountLimit?: number;
            socialMedia?: {
                discord?: string;
                twitter?: string;
                youtube?: string;
            };
        }) => {
            if (payload.campaignId !== campaignId) return;

            setCampaign((current) =>
                current
                    ? {
                          ...current,
                          title: payload.title ?? current.title,
                          description: payload.description ?? current.description,
                          mainHistory: payload.mainHistory ?? current.mainHistory,
                          visibility: payload.visibility ?? current.visibility,
                          ageRestriction:
                              payload.ageRestriction ?? current.ageRestriction,
                          nextMatchDate: payload.nextMatchDate ?? current.nextMatchDate,
                          nextSessionResume:
                              payload.nextSessionResume ?? current.nextSessionResume,
                          playerAmountLimit:
                              payload.playerAmountLimit ?? current.playerAmountLimit,
                          socialMedia: payload.socialMedia ?? current.socialMedia,
                      }
                    : current
            );
        };

        const handleDungeonMasterTransferred = (payload: { campaignId: string }) => {
            if (payload.campaignId !== campaignId) return;
            refreshCampaign();
        };

        const handleSocketError = (payload: { message: string }) => {
            reportSocketIssue(payload.message);
        };

        socket.on('campaign:sync', handleCampaignSync);
        socket.on('presence:user_joined', handlePresenceJoined as never);
        socket.on('presence:user_left', handlePresenceLeft as never);
        socket.on(
            'presence:confirmed_players_updated',
            handleConfirmedPlayersUpdated as never
        );
        socket.on('journal:post_created', handleJournalPostCreated as never);
        socket.on('journal:highlight_changed', handleHighlightChanged as never);
        socket.on('campaign:player_joined', handlePlayerJoined as never);
        socket.on('campaign:player_left', handlePlayerLeft as never);
        socket.on('campaign:maps_updated', handleMapsUpdated as never);
        socket.on('campaign:musics_updated', handleMusicsUpdated as never);
        socket.on('campaign:settings_updated', handleSettingsUpdated as never);
        socket.on(
            'campaign:dungeon_master_transferred',
            handleDungeonMasterTransferred as never
        );
        socket.on('campaign:error', handleSocketError as never);

        emitCampaignSocketAck(socket, 'campaign:join', { campaignId }).then((ack) => {
            if (!ack.ok) {
                reportSocketIssue(ack.error.message);
            }
        });

        return () => {
            socket.off('campaign:sync', handleCampaignSync);
            socket.off('presence:user_joined', handlePresenceJoined as never);
            socket.off('presence:user_left', handlePresenceLeft as never);
            socket.off(
                'presence:confirmed_players_updated',
                handleConfirmedPlayersUpdated as never
            );
            socket.off('journal:post_created', handleJournalPostCreated as never);
            socket.off('journal:highlight_changed', handleHighlightChanged as never);
            socket.off('campaign:player_joined', handlePlayerJoined as never);
            socket.off('campaign:player_left', handlePlayerLeft as never);
            socket.off('campaign:maps_updated', handleMapsUpdated as never);
            socket.off('campaign:musics_updated', handleMusicsUpdated as never);
            socket.off('campaign:settings_updated', handleSettingsUpdated as never);
            socket.off(
                'campaign:dungeon_master_transferred',
                handleDungeonMasterTransferred as never
            );
            socket.off('campaign:error', handleSocketError as never);
            disconnectCampaignSocket();
        };
    }, [campaignId, refreshCampaign, userInfo?.userId]);

    useEffect(() => {
        if (!campaign?.confirmedPlayers?.length || !userInfo?.userId) {
            setPresenceConfirmed(false);
            return;
        }
        const isConfirmed = campaign.confirmedPlayers.some(
            (entry) => entry.userId === userInfo.userId
        );
        setPresenceConfirmed(isConfirmed);
    }, [campaign?.confirmedPlayers, userInfo?.userId]);

    const userRole = campaign?.campaignPlayers.find((p) => p.userId === userInfo?.userId)
        ?.role;

    const isMasterCampaign = userCampaigns.master.some(
        (c) => c.campaignId === campaignId
    );

    const isPlayer = userRole === 'player' || userRole === 'admin_player';
    const isMaster = userRole === 'dungeon_master' || isMasterCampaign;
    const isAdminPlayer = userRole === 'admin_player';
    const isSelectedPostAuthor =
        !!selectedPost?.author?.userId && selectedPost.author.userId === userInfo?.userId;
    const canDeleteSelectedPost =
        !!selectedPost && (isMaster || isAdminPlayer || isSelectedPostAuthor);
    const canEditSelectedPost = !!selectedPost && isSelectedPostAuthor;

    const CATEGORY_LABEL: Record<string, string> = {
        all: 'Todos',
        master: 'Mestre',
        admin: 'Admin',
        players: 'Jogadores',
        'characters-players': 'Personagens (Jogadores)',
        'characters-master': 'Personagens (Mestre)',
        environment: 'Ambiente',
        'world-news': 'Notícias do Mundo',
        announcements: 'Anúncios',
    };

    const postFilters = Object.keys(CATEGORY_LABEL);
    const [activeFilter, setActiveFilter] = useState('all');

    const filteredPosts =
        activeFilter === 'all'
            ? journalPosts
            : journalPosts.filter((p) => p.category === activeFilter);

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
        const titles = journalPosts.map((p) => p.title);
        const shuffled = [...titles].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [journalPosts]);

    if (!campaign) {
        return (
            <main>
                <LoggedHeader />
                <div className="lobby-loading">
                    <span className="font-M-semibold">Carregando campanha...</span>
                </div>
            </main>
        );
    }

    return (
        <main>
            <LoggedHeader />
            <div className="lobby-wrapper">
                <section className="lobby-content">
                    <div className="lobby-cover">
                        <Image
                            src={campaign.cover?.link}
                            alt={campaign.title}
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    <h1 className="lobby-title font-XL-bold">{campaign.title}</h1>
                    <p className="lobby-description font-XS-regular">
                        {campaign.description}
                    </p>
                    <div className="lobby-info-bar">
                        <div className="lobby-info-bar-row">
                            <div className="lobby-info-item">
                                <span className="font-XS-bold">Próxima sessão:</span>
                                <span className="font-XS-regular">
                                    {campaign.nextMatchDate &&
                                    campaign.nextMatchDate !== 'no-date'
                                        ? formatDate(campaign.nextMatchDate)
                                        : 'Não agendado'}
                                </span>
                            </div>
                            {Object.entries(campaign.socialMedia)
                                .filter(([name, link]) => name !== '_id' && link)
                                .map(([name, link]) => (
                                    <div key={name} className="lobby-info-item">
                                        <span className="font-XS-bold">
                                            {name.charAt(0).toUpperCase() + name.slice(1)}
                                            :
                                        </span>
                                        <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="lobby-info-link font-XS-regular"
                                        >
                                            {link}
                                        </a>
                                    </div>
                                ))}
                        </div>
                        <button
                            className={`lobby-confirm-presence font-XS-bold ${
                                presenceConfirmed
                                    ? 'lobby-confirm-presence--confirmed'
                                    : ''
                            }`}
                            onClick={async () => {
                                try {
                                    await confirmPlayerPresence(
                                        campaignId,
                                        presenceConfirmed
                                    );
                                    refreshCampaign();
                                } catch {
                                    // silently ignore
                                }
                            }}
                        >
                            {presenceConfirmed
                                ? '✔ Presença confirmada'
                                : 'Clique aqui para confirmar a presença na próxima sessão'}
                        </button>
                        <button
                            className="lobby-session-preview-btn font-XS-bold"
                            onClick={() => setSessionPreviewOpen(true)}
                        >
                            Resumo da próxima sessão
                        </button>
                        <button
                            className="lobby-session-preview-btn font-XS-bold"
                            onClick={() => setCampaignHistoryOpen(true)}
                        >
                            {'Hist\u00f3ria da Campanha'}
                        </button>
                    </div>
                    {sessionPreviewOpen && (
                        <div
                            className="lobby-session-modal-overlay"
                            onClick={() => setSessionPreviewOpen(false)}
                        >
                            <div
                                className="lobby-session-modal"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="lobby-session-modal-header">
                                    <h3 className="font-M-semibold">
                                        Resumo da próxima sessão
                                    </h3>
                                    <button
                                        className="lobby-session-modal-close font-M-semibold"
                                        onClick={() => setSessionPreviewOpen(false)}
                                    >
                                        ×
                                    </button>
                                </div>
                                <p className="font-S-regular lobby-session-modal-text">
                                    {campaign.nextSessionResume ||
                                        'Sem resumo disponível para a próxima sessão.'}
                                </p>
                            </div>
                        </div>
                    )}
                    {campaignHistoryOpen && (
                        <div
                            className="lobby-session-modal-overlay"
                            onClick={() => setCampaignHistoryOpen(false)}
                        >
                            <div
                                className="lobby-session-modal"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="lobby-session-modal-header">
                                    <h3 className="font-M-semibold">
                                        {'Hist\u00f3ria da Campanha'}
                                    </h3>
                                    <button
                                        className="lobby-session-modal-close font-M-semibold"
                                        onClick={() => setCampaignHistoryOpen(false)}
                                    >
                                        &times;
                                    </button>
                                </div>
                                <p className="font-S-regular lobby-session-modal-text">
                                    {campaign.mainHistory ||
                                        'Sem hist\u00f3ria dispon\u00edvel para esta campanha.'}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="lobby-characters">
                        <h2 className="font-L-semibold">Confirmados Próxima Sessão</h2>
                        <div className="lobby-characters-slider">
                            {confirmedPlayersInfo.length > 0 ? (
                                confirmedPlayersInfo.map((player) => (
                                    <div key={player.userId} className="lobby-character">
                                        <div className="lobby-character-avatar">
                                            <Image
                                                src={player.picture}
                                                alt={player.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <span className="font-XXS-regular">
                                            {player.name}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <span className="font-XS-regular">
                                    Nenhum jogador confirmado
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="lobby-characters">
                        <h2 className="font-L-semibold">Personagens</h2>
                        <div className="lobby-characters-slider">
                            {lobbyCharacters.length > 0 ? (
                                lobbyCharacters.map((char) => (
                                    <div key={char.id} className="lobby-character">
                                        <div className="lobby-character-avatar">
                                            <Image
                                                src={char.image}
                                                alt={char.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <span className="font-XXS-regular">
                                            {char.name}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <span className="font-XS-regular">
                                    Nenhum personagem criado
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="lobby-articles">
                        <h2 className="font-L-semibold">Jornal da Campanha</h2>
                        <div className="lobby-articles-box">
                            <div className="lobby-ticker">
                                <span className="lobby-ticker-label font-XXS-bold">
                                    O que os Goblins andam lendo:
                                </span>
                                <div className="lobby-ticker-track">
                                    <div className="lobby-ticker-content">
                                        {rollingTitles.map((title, i) => (
                                            <span
                                                key={i}
                                                className="lobby-ticker-item font-XXS-regular"
                                            >
                                                {title}
                                            </span>
                                        ))}
                                        {rollingTitles.map((title, i) => (
                                            <span
                                                key={`dup-${i}`}
                                                className="lobby-ticker-item font-XXS-regular"
                                            >
                                                {title}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="lobby-articles-filters">
                                {postFilters.map((filter) => (
                                    <button
                                        key={filter}
                                        className={`lobby-filter-btn font-XXS-bold ${
                                            activeFilter === filter
                                                ? 'lobby-filter-btn-active'
                                                : ''
                                        }`}
                                        onClick={() => setActiveFilter(filter)}
                                    >
                                        {CATEGORY_LABEL[filter]}
                                    </button>
                                ))}
                            </div>
                            <div className="lobby-articles-list">
                                {filteredPosts.length > 0 ? (
                                    filteredPosts.map((post, i) => (
                                        <article
                                            key={i}
                                            className="lobby-article"
                                            onClick={() => {
                                                setPostActionError('');
                                                setSelectedPost(post);
                                            }}
                                        >
                                            <div className="lobby-article-info">
                                                {areJournalPostsEqual(
                                                    highlightedJournalPost,
                                                    post
                                                ) && (
                                                    <span className="font-XXS-bold">
                                                        Em destaque
                                                    </span>
                                                )}
                                                <h3 className="font-S-bold">
                                                    {post.title}
                                                </h3>
                                                <p className="lobby-article-resume font-XS-regular">
                                                    {post.content.split('\n')[0]}
                                                </p>
                                                <span className="lobby-article-date font-XXS-regular">
                                                    {formatDate(post.timestamp)}
                                                </span>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <span className="font-XS-regular lobby-articles-empty">
                                        Nenhuma publicação nesta categoria.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                <LobbySideMenu
                    isPlayer={isPlayer}
                    isMaster={isMaster}
                    onMenuAction={(key) => {
                        if (key === 'play-match')
                            router.push(`/campaigns/match?campaignId=${campaignId}`);
                        if (key === 'create-sheet') setSheetModalOpen(true);
                        if (key === 'participants') setParticipantsModalOpen(true);
                        if (key === 'new-post') setCreatePostModalOpen(true);
                        if (key === 'edit-settings') setEditSettingsModalOpen(true);
                        if (key === 'leave') setLeaveCampaignModalOpen(true);
                    }}
                />
            </div>
            {createPostModalOpen && campaign && (
                <CreatePostModal
                    campaignId={campaign.campaignId}
                    userRole={userRole}
                    onClose={() => setCreatePostModalOpen(false)}
                    onCreated={() => refreshJournalPosts()}
                />
            )}
            {editingPost && campaign && (
                <CreatePostModal
                    campaignId={campaign.campaignId}
                    userId={userInfo?.userId ?? ''}
                    userRole={userRole}
                    mode="edit"
                    initialPost={editingPost}
                    onClose={() => setEditingPost(null)}
                    onCreated={async (updatedPost) => {
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
            )}
            {selectedPost && !editingPost && (
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
            )}
            {participantsModalOpen && campaign && (
                <ParticipantsModal
                    campaignId={campaign.campaignId}
                    isMaster={isMaster}
                    onClose={() => setParticipantsModalOpen(false)}
                />
            )}
            {sheetModalOpen && campaign && (
                <CharacterSheetModal
                    campaignId={campaign.campaignId}
                    userId={userInfo?.userId ?? ''}
                    isPlayer={isPlayer}
                    isMaster={isMaster}
                    onClose={() => setSheetModalOpen(false)}
                />
            )}
            {leaveCampaignModalOpen && campaign && (
                <LeaveCampaignModal
                    campaignId={campaign.campaignId}
                    isMaster={isMaster}
                    onClose={() => setLeaveCampaignModalOpen(false)}
                />
            )}
            {editSettingsModalOpen && campaign && (
                <EditCampaignModal
                    campaignId={campaign.campaignId}
                    initialData={{
                        title: campaign.title,
                        description: campaign.description,
                        nextMatchDate: campaign.nextMatchDate,
                        socialMedia: campaign.socialMedia,
                        nextSessionResume: campaign.nextSessionResume,
                        visibility: campaign.visibility,
                        ageRestriction: campaign.ageRestriction,
                        playerAmountLimit: campaign.playerAmountLimit,
                        adminId:
                            campaign.campaignPlayers.find(
                                (p) => p.role === 'admin_player'
                            )?.userId ?? '',
                        cover: campaign.cover?.link ?? '',
                        mapImages: campaign.mapImages?.map((m) => m.link) ?? [],
                        musics: campaign.musics ?? [],
                    }}
                    onClose={() => setEditSettingsModalOpen(false)}
                    onSaved={refreshCampaign}
                />
            )}
            <Footer />
        </main>
    );
}
