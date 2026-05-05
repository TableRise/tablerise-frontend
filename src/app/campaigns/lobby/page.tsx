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
    getCampaignJournalPosts,
    type JournalPost,
} from '@/server/campaigns/get-journal-posts';
import {
    getCharactersByCampaignLobby,
    type CampaignCharacter,
} from '@/server/characters/get-characters';
import '@/app/campaigns/lobby/page.css';
import Footer from '@/components/common/Footer';

interface CampaignData {
    campaignId: string;
    title: string;
    cover: { link: string };
    description: string;
    system: string;
    campaignPlayers: { userId: string; role: string }[];
    nextMatchDate: string;
    socialMedia: { discord?: string; twitter?: string; youtube?: string };
    confirmedPlayers: (string | { userId: string })[];
    visibility: string;
    ageRestriction: string;
    nextSessionResume: string;
    playerAmountLimit: number;
    mapImages: { link: string }[];
    musics: CampaignMusic[];
}

interface ConfirmedPlayerInfo {
    userId: string;
    name: string;
    picture: string;
}

export default function CampaignLobby(): JSX.Element {
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId') ?? '';
    const router = useRouter();
    const { userCampaigns } = useContext(TableriseContext);
    const [campaign, setCampaign] = useState<CampaignData | null>(null);
    const [presenceConfirmed, setPresenceConfirmed] = useState(false);
    const [sessionPreviewOpen, setSessionPreviewOpen] = useState(false);
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
    const [selectedPost, setSelectedPost] = useState<JournalPost | null>(null);
    useEffect(() => {
        if (!campaignId) return;

        const cached =
            userCampaigns.master.find((c) => c.campaignId === campaignId) ||
            userCampaigns.player.find((c) => c.campaignId === campaignId);

        if (cached) {
            setCampaign({
                campaignId: cached.campaignId,
                title: cached.title,
                cover: { link: cached.cover?.link },
                description: cached.description,
                system: cached.system,
                campaignPlayers: cached.campaignPlayers,
                nextMatchDate: cached.infos?.nextMatchDate ?? '',
                socialMedia: cached.infos?.socialMedia ?? {},
                confirmedPlayers: cached.matchData?.confirmedPlayers ?? [],
                mapImages: cached.matchData?.mapImages ?? [],
                musics: cached.musics ?? [],
                visibility: cached.visibility ?? '',
                ageRestriction: cached.ageRestriction ?? '',
                nextSessionResume: cached.matchData?.nextSessionResume ?? '',
                playerAmountLimit: cached.infos?.playerAmountLimit ?? 1,
            });
        }
        getCampaignById(campaignId).then((data) => {
            if (data)
                setCampaign({
                    campaignId: data.campaignId,
                    title: data.title,
                    cover: { link: data.cover?.link },
                    description: data.description,
                    system: data.system,
                    campaignPlayers: data.campaignPlayers,
                    nextMatchDate: data.infos?.nextMatchDate ?? '',
                    socialMedia: data.infos?.socialMedia ?? {},
                    confirmedPlayers: data.matchData?.confirmedPlayers ?? [],
                    mapImages: data.matchData?.mapImages ?? [],
                    musics: data.musics ?? [],
                    visibility: data.visibility ?? '',
                    ageRestriction: data.ageRestriction ?? '',
                    nextSessionResume: data.matchData?.nextSessionResume ?? '',
                    playerAmountLimit: data.infos?.playerAmountLimit ?? 1,
                });
        });
    }, [campaignId, userCampaigns]);

    useEffect(() => {
        if (!campaignId) return;
        getCharactersByCampaignLobby(campaignId).then(setLobbyCharacters);
    }, [campaignId]);

    useEffect(() => {
        if (!campaignId) return;
        getCampaignJournalPosts(campaignId).then(setJournalPosts);
    }, [campaignId]);

    const refreshCampaign = useCallback(() => {
        if (!campaignId) return;
        getCampaignById(campaignId).then((data) => {
            if (data)
                setCampaign({
                    campaignId: data.campaignId,
                    title: data.title,
                    cover: { link: data.cover?.link },
                    description: data.description,
                    system: data.system,
                    campaignPlayers: data.campaignPlayers,
                    nextMatchDate: data.infos?.nextMatchDate ?? '',
                    socialMedia: data.infos?.socialMedia ?? {},
                    confirmedPlayers: data.matchData?.confirmedPlayers ?? [],
                    mapImages: data.matchData?.mapImages ?? [],
                    musics: data.musics ?? [],
                    visibility: data.visibility ?? '',
                    ageRestriction: data.ageRestriction ?? '',
                    nextSessionResume: data.matchData?.nextSessionResume ?? '',
                    playerAmountLimit: data.infos?.playerAmountLimit ?? 1,
                });
        });
    }, [campaignId]);

    useEffect(() => {
        if (!campaign?.confirmedPlayers?.length) {
            setConfirmedPlayersInfo([]);
            return;
        }

        Promise.all(
            campaign.confirmedPlayers.map(async (entry) => {
                const userId = typeof entry === 'string' ? entry : (entry as any).userId;
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

    const userInfo =
        typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('userLogged') as string)
            : null;

    useEffect(() => {
        if (!campaign?.confirmedPlayers?.length || !userInfo?.userId) {
            setPresenceConfirmed(false);
            return;
        }
        const isConfirmed = campaign.confirmedPlayers.some((entry) => {
            const id = typeof entry === 'string' ? entry : (entry as any).userId;
            return id === userInfo.userId;
        });
        setPresenceConfirmed(isConfirmed);
    }, [campaign?.confirmedPlayers, userInfo?.userId]);

    const userRole = campaign?.campaignPlayers.find((p) => p.userId === userInfo?.userId)
        ?.role;

    const isMasterCampaign = userCampaigns.master.some(
        (c) => c.campaignId === campaignId
    );

    const isPlayer = userRole === 'player' || userRole === 'admin_player';
    const isMaster =
        userRole === 'master' || userRole === 'dungeon_master' || isMasterCampaign;

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
                                            onClick={() => setSelectedPost(post)}
                                        >
                                            <div className="lobby-article-info">
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
                    onCreated={() =>
                        getCampaignJournalPosts(campaign.campaignId).then(setJournalPosts)
                    }
                />
            )}
            {selectedPost && (
                <JournalPostModal
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
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
