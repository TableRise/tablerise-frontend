'use client';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import TableriseContext from '@/context/TableriseContext';
import LoggedHeader from '@/components/common/LoggedHeader';
import LobbySideMenu from '@/components/lobby/LobbySideMenu';
import { getCampaignById, confirmPlayerPresence } from '@/server/campaigns/join-campaign';
import { getUser } from '@/server/users/get-user';
import formatDate from '@/utils/formatDate';
import CharacterSheetModal from '@/components/lobby/CharacterSheetModal';
import '@/app/campaigns/lobby/page.css';

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
}

interface ConfirmedPlayerInfo {
    userId: string;
    name: string;
    picture: string;
}

export default function CampaignLobby(): JSX.Element {
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId') ?? '';
    const { userCampaigns } = useContext(TableriseContext);
    const [campaign, setCampaign] = useState<CampaignData | null>(null);
    const [presenceConfirmed, setPresenceConfirmed] = useState(false);
    const [sessionPreviewOpen, setSessionPreviewOpen] = useState(false);
    const [confirmedPlayersInfo, setConfirmedPlayersInfo] = useState<
        ConfirmedPlayerInfo[]
    >([]);
    const [sheetModalOpen, setSheetModalOpen] = useState(false);

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
            });
        } else {
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
                    });
            });
        }
    }, [campaignId, userCampaigns]);

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
    const isMaster = userRole === 'master' || isMasterCampaign;

    const postFilters = [
        'Mestre',
        'Admin',
        'Players',
        'Personagens (Jogadores)',
        'Personagens (Mestre)',
        'Ambiente',
        'Notícias do Mundo',
        'Anúncios',
    ];
    const [activeFilter, setActiveFilter] = useState('Mestre');

    const placeholderArticles = [
        {
            id: '1',
            title: 'Sessão 1 - O Início da Jornada',
            resume: 'A aventura começou em uma taverna antiga...',
            date: '12/04/2026',
            thumbnail: '/images/SideImageBackground.svg',
        },
        {
            id: '2',
            title: 'Sessão 2 - A Floresta Sombria',
            resume: 'O grupo adentrou a floresta e encontrou criaturas misteriosas...',
            date: '14/04/2026',
            thumbnail: '/images/SideImageBackground.svg',
        },
        {
            id: '3',
            title: 'Sessão 3 - O Covil do Dragão',
            resume: 'Finalmente chegaram ao covil, onde o ar estava quente...',
            date: '16/04/2026',
            thumbnail: '/images/SideImageBackground.svg',
        },
        {
            id: '4',
            title: 'Sessão 3 - O Covil do Dragão',
            resume: 'Finalmente chegaram ao covil, onde o ar estava quente...',
            date: '16/04/2026',
            thumbnail: '/images/SideImageBackground.svg',
        },
        {
            id: '5',
            title: 'Sessão 3 - O Covil do Dragão',
            resume: 'Finalmente chegaram ao covil, onde o ar estava quente...',
            date: '16/04/2026',
            thumbnail: '/images/SideImageBackground.svg',
        },
        {
            id: '6',
            title: 'Sessão 3 - O Covil do Dragão',
            resume: 'Finalmente chegaram ao covil, onde o ar estava quente...',
            date: '16/04/2026',
            thumbnail: '/images/SideImageBackground.svg',
        },
        {
            id: '7',
            title: 'Sessão 3 - O Covil do Dragão',
            resume: 'Finalmente chegaram ao covil, onde o ar estava quente...',
            date: '16/04/2026',
            thumbnail: '/images/SideImageBackground.svg',
        },
    ];

    const rollingTitles = useMemo(() => {
        const shuffled = [...placeholderArticles].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3).map((a) => a.title);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                                    Na próxima sessão, o grupo seguirá rumo à floresta
                                    sombria em busca do artefato perdido. Rumores indicam
                                    a presença de criaturas hostis no caminho. Preparem
                                    seus equipamentos e revisem seus feitiços — a jornada
                                    promete ser intensa.
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
                            {[
                                {
                                    id: '1',
                                    name: 'Thorin',
                                    image: '/images/SideImageBackground.svg',
                                },
                                {
                                    id: '2',
                                    name: 'Elara',
                                    image: '/images/SideImageBackground.svg',
                                },
                                {
                                    id: '3',
                                    name: 'Grimm',
                                    image: '/images/SideImageBackground.svg',
                                },
                                {
                                    id: '4',
                                    name: 'Lyra',
                                    image: '/images/SideImageBackground.svg',
                                },
                                {
                                    id: '5',
                                    name: 'Zarak',
                                    image: '/images/SideImageBackground.svg',
                                },
                                {
                                    id: '6',
                                    name: 'Mira',
                                    image: '/images/SideImageBackground.svg',
                                },
                                {
                                    id: '7',
                                    name: 'Orin',
                                    image: '/images/SideImageBackground.svg',
                                },
                                {
                                    id: '8',
                                    name: 'Nyx',
                                    image: '/images/SideImageBackground.svg',
                                },
                            ].map((char) => (
                                <div key={char.id} className="lobby-character">
                                    <div className="lobby-character-avatar">
                                        <Image
                                            src={char.image}
                                            alt={char.name}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <span className="font-XXS-regular">{char.name}</span>
                                </div>
                            ))}
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
                                        {filter}
                                    </button>
                                ))}
                            </div>
                            <div className="lobby-articles-list">
                                {placeholderArticles.map((article) => (
                                    <article key={article.id} className="lobby-article">
                                        <div className="lobby-article-thumbnail">
                                            <Image
                                                src={article.thumbnail}
                                                alt={article.title}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="lobby-article-info">
                                            <h3 className="font-S-bold">
                                                {article.title}
                                            </h3>
                                            <p className="lobby-article-resume font-XS-regular">
                                                {article.resume}
                                            </p>
                                            <span className="lobby-article-date font-XXS-regular">
                                                {article.date}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                <LobbySideMenu
                    isPlayer={isPlayer}
                    isMaster={isMaster}
                    onMenuAction={(key) => {
                        if (key === 'create-sheet') setSheetModalOpen(true);
                    }}
                />
            </div>
            {sheetModalOpen && campaign && (
                <CharacterSheetModal
                    campaignId={campaign.campaignId}
                    userId={userInfo?.userId ?? ''}
                    isPlayer={isPlayer}
                    onClose={() => setSheetModalOpen(false)}
                />
            )}
        </main>
    );
}
