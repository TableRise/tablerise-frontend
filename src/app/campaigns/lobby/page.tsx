'use client';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import CopyBlueSVG from '@assets/icons/sys/copy-blue.svg?url';
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
import ShopModal from '@/components/lobby/ShopModal';
import CampaignHistoryModal from '@/components/lobby/CampaignHistoryModal';
import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import type { DatabaseCampaignBuyRecord } from '@/types/shared/entities';
import {
    deleteCampaignJournalPost,
    getCampaignJournalPosts,
    getCampaignHighlightedJournalPost,
    type JournalPost,
} from '@/server/campaigns/get-journal-posts';
import type { SocketPlayer, SocketPresenceUser } from '@/types/shared/socket';
import {
    getCharactersByCampaignLobby,
    type CampaignCharacter,
} from '@/server/characters/get-characters';
import type { ImageObject } from '@/types/shared/general';
import '@/app/campaigns/lobby/page.css';
import Footer from '@/components/common/Footer';

interface CampaignData {
    campaignId: string;
    code: string;
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
    xpSystem: boolean;
    shopSystem: boolean;
    mapImages: ImageObject[];
    logs: { loggedAt: string; content: string }[];
    musics: CampaignMusic[];
    buys: DatabaseCampaignBuyRecord[];
}

interface ConfirmedPlayerInfo {
    userId: string;
    name: string;
    picture: string;
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
        code: data.code ?? '',
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
        logs: data.matchData?.logs ?? [],
        musics: data.musics ?? [],
        buys: Array.isArray(data.buys) ? data.buys : [],
        visibility: data.visibility ?? '',
        ageRestriction: data.ageRestriction ?? '',
        nextSessionResume: data.matchData?.nextSessionResume ?? '',
        playerAmountLimit: data.infos?.playerAmountLimit ?? 1,
        xpSystem: data.configurations?.xpSystem ?? true,
        shopSystem:
            data.configurations?.shopSystem ?? data.configurations?.shopOn ?? false,
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
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
    const [editSettingsModalOpen, setEditSettingsModalOpen] = useState(false);
    const [leaveCampaignModalOpen, setLeaveCampaignModalOpen] = useState(false);
    const [shopModalOpen, setShopModalOpen] = useState(false);
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
    const handleCopyCampaignCode = useCallback(async () => {
        if (!campaign?.code) return;

        try {
            await navigator.clipboard.writeText(campaign.code);
        } catch {
            // silently ignore clipboard errors
        }
    }, [campaign?.code]);
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
        'world-news': 'NotÃ­cias do Mundo',
        announcements: 'AnÃºncios',
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
                                <span className="font-XS-bold">próxima sessão:</span>
                                <span className="font-XS-regular">
                                    {campaign.nextMatchDate &&
                                    campaign.nextMatchDate !== 'no-date'
                                        ? formatDate(campaign.nextMatchDate)
                                        : 'NÃ£o agendado'}
                                </span>
                            </div>
                            {Object.entries(campaign.socialMedia)
                                .filter(([name, link]) => name !== '_id' && link)
                                .map(([name, link]) => (
                                    <div
                                        key={name}
                                        className="lobby-info-item lobby-social-item"
                                    >
                                        <span className="font-XS-bold">
                                            {name.charAt(0).toUpperCase() + name.slice(1)}
                                            :
                                        </span>
                                        <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="lobby-info-link lobby-info-link--truncate font-XS-regular"
                                        >
                                            {link}
                                        </a>
                                    </div>
                                ))}
                        </div>
                        <div className="lobby-info-bar-row">
                            <div className="lobby-info-item lobby-code-item">
                                <span className="font-XS-bold">CÃ³digo da campanha:</span>
                                <span className="font-XS-regular">
                                    {campaign.code || '-'}
                                </span>
                                <button
                                    type="button"
                                    className="lobby-copy-btn"
                                    onClick={handleCopyCampaignCode}
                                    disabled={!campaign.code}
                                    aria-label="Copiar CÃ³digo da campanha"
                                >
                                    <Image
                                        src={CopyBlueSVG.src}
                                        alt="Copiar CÃ³digo da campanha"
                                        width={18}
                                        height={18}
                                    />
                                </button>
                            </div>
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
                                ? 'âœ” presença confirmada'
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
                        <div className="lobby-session-modal-overlay">
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
                                        x
                                    </button>
                                </div>
                                <p className="font-S-regular lobby-session-modal-text">
                                    {campaign.nextSessionResume ||
                                        'Sem resumo disponÃ­vel para a próxima sessão.'}
                                </p>
                            </div>
                        </div>
                    )}
                    {campaignHistoryOpen && (
                        <div className="lobby-session-modal-overlay">
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
                        <h2 className="font-L-semibold">Confirmados próxima sessão</h2>
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
                                        Nenhuma publicaÃ§Ã£o nesta categoria.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                <LobbySideMenu
                    isPlayer={isPlayer}
                    isMaster={isMaster}
                    shopEnabled={campaign.shopSystem}
                    onMenuAction={(key) => {
                        if (key === 'play-match')
                            router.push(`/campaigns/match?campaignId=${campaignId}`);
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
            {historyModalOpen && campaign && (
                <CampaignHistoryModal
                    logs={campaign.logs}
                    onClose={() => setHistoryModalOpen(false)}
                />
            )}
            {sheetModalOpen && campaign && (
                <CharacterSheetModal
                    campaignId={campaign.campaignId}
                    userId={userInfo?.userId ?? ''}
                    isPlayer={isPlayer}
                    isMaster={isMaster}
                    xpSystem={campaign.xpSystem}
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
            {shopModalOpen && (
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
                        shopOn: campaign.shopSystem,
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
