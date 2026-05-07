/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import DiceBoxThreejs, { type DiceBoxThreejsRollResult } from '@3d-dice/dice-box-threejs';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCampaignById } from '@/server/campaigns/join-campaign';
import {
    getCampaignHighlightedJournalPost,
    getCampaignJournalPosts,
    setCampaignHighlightedJournalPost,
    type JournalPost,
} from '@/server/campaigns/get-journal-posts';
import {
    getCharacterById,
    getCharactersByCampaignLobby,
    getCharactersByPlayer,
    type CampaignCharacter,
    type FullCharacterDnd,
} from '@/server/characters/get-characters';
import {
    getDnd5eClassById,
    getDnd5eRaceById,
    getDnd5eSpellById,
} from '@/server/dungeons&dragons5e/system';
import CharacterSheetModal from '@/components/lobby/CharacterSheetModal';
import CharacterDetailModal from '@/components/lobby/CharacterDetailModal';
import JournalPostModal from '@/components/lobby/JournalPostModal';
import MatchEffectsModal, { type MapEffect } from '@/components/match/MatchEffectsModal';
import MatchAvatarSelectionModal from '@/components/match/MatchAvatarSelectionModal';
import MapFogOverlay, { type FogVariant } from '@/components/match/MapFogOverlay';
import MapRainOverlay from '@/components/match/MapRainOverlay';
import MatchMediaModal from '@/components/lobby/MatchMediaModal';
import MatchNotesModal from '@/components/match/MatchNotesModal';
import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import LogoSVG from '../../../../assets/icons/logo-blue.svg?url';
import SheetSVG from '../../../../assets/icons/menu-panel-lobby/sheet.svg?url';
import MediaSVG from '../../../../assets/icons/menu-panel-lobby/media.svg?url';
import LeftPanelOpenSVG from '../../../../assets/icons/game/left-panel-open.svg?url';
import NotesBlueSVG from '../../../../assets/icons/game/notes-blue.svg?url';
import StarBlueSVG from '../../../../assets/icons/game/star-blue.svg?url';
import AvatarSelectionSVG from '../../../../assets/icons/game/avatar-selection.svg?url';
import ResizeBlueSVG from '../../../../assets/icons/game/resize-blue.svg?url';
import CloneSVG from '../../../../assets/icons/game/clone.svg?url';
import BookmarkSVG from '../../../../assets/icons/game/bookmark.svg?url';
import DiceSVG from '../../../../assets/icons/dice/default.svg?url';
import D4SVG from '../../../../assets/icons/dice/d4.svg?url';
import D6SVG from '../../../../assets/icons/dice/d6.svg?url';
import D8SVG from '../../../../assets/icons/dice/d8.svg?url';
import D10SVG from '../../../../assets/icons/dice/d10.svg?url';
import D12SVG from '../../../../assets/icons/dice/d12.svg?url';
import D20SVG from '../../../../assets/icons/dice/d20.svg?url';
import ExitRedSVG from '../../../../assets/icons/sys/exit-red.svg?url';
import GridOffSVG from '../../../../assets/icons/nav/grid-off-blue.svg?url';
import GridOnSVG from '../../../../assets/icons/nav/grind-on-blue.svg?url';
import SideImageBackground from '../../../../public/images/SideImageBackground.svg?url';
import '@/app/campaigns/match/page.css';

const ABILITY_LABELS: Record<string, string> = {
    str: 'Força',
    dex: 'Destreza',
    con: 'Constituição',
    int: 'Inteligência',
    wis: 'Sabedoria',
    cha: 'Carisma',
};

const SKILL_LABELS: Record<string, string> = {
    athletics: 'Atletismo',
    acrobatics: 'Acrobacia',
    sleightOfHand: 'Prestidigitação',
    stealth: 'Furtividade',
    arcana: 'Arcanismo',
    history: 'História',
    investigation: 'Investigação',
    nature: 'Natureza',
    religion: 'Religião',
    animalHandling: 'Lidar com Animais',
    insight: 'Intuição',
    medicine: 'Medicina',
    perception: 'Percepção',
    survival: 'Sobrevivência',
    deception: 'Enganação',
    intimidation: 'Intimidação',
    performance: 'Atuação',
    persuasion: 'Persuasão',
};

const MIN_TOKEN_WIDTH_PCT = 4.5;
const DEFAULT_TOKEN_WIDTH_PCT = MIN_TOKEN_WIDTH_PCT;
const MAX_TOKEN_WIDTH_PCT = 14;
const TOKEN_SHELL_ASPECT_RATIO = 58 / 52;
const TOKEN_INFO_HEIGHT_PX = 44;
const DRAG_CLICK_THRESHOLD_PX = 6;
const MATCH_DICE_BOX_HOST_ID = 'match-dice-box-host';

type DiceRollStatus = 'idle' | 'rolling' | 'settled';

interface DiceRollSession {
    status: DiceRollStatus;
    label: string;
    count: number;
    notation: string;
    rolls: number[] | null;
    total: number | null;
}

function createIdleDiceRollSession(): DiceRollSession {
    return {
        status: 'idle',
        label: '',
        count: 1,
        notation: '',
        rolls: null,
        total: null,
    };
}

function signed(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
}

function areJournalPostsEqual(
    first: JournalPost | null,
    second: JournalPost | null
): boolean {
    if (!first || !second) return false;

    return (
        first.title === second.title &&
        first.timestamp === second.timestamp &&
        first.category === second.category &&
        first.content === second.content
    );
}

function getMapTokenPosition(
    index: number,
    total: number
): {
    left: string;
    top: string;
} {
    const columns = Math.max(1, Math.min(total, 5));
    const row = Math.floor(index / columns);
    const column = index % columns;
    const spread = columns === 1 ? 0.5 : column / (columns - 1);
    const left = 22 + spread * 56;
    const top = Math.min(60 + row * 14 + (column % 2 === 0 ? 0 : 2), 86);

    return {
        left: `${left}%`,
        top: `${top}%`,
    };
}

interface MapTokenSummary {
    currentHitPoints: number | null;
    level: number | null;
}

interface MapTokenLayout {
    xPct: number;
    yPct: number;
    widthPct: number;
}

interface MapTokenInstance {
    tokenId: string;
    characterId: string;
    isClone: boolean;
}

type TokenInteractionType = 'drag' | 'resize';

interface ActiveTokenInteraction {
    type: TokenInteractionType;
    tokenId: string;
    startClientX: number;
    startClientY: number;
    startXPct: number;
    startYPct: number;
    startWidthPct: number;
    didMove: boolean;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function getTokenTotalHeightPx(widthPx: number): number {
    return widthPx * TOKEN_SHELL_ASPECT_RATIO + TOKEN_INFO_HEIGHT_PX;
}

function createDefaultTokenLayout(
    index: number,
    total: number,
    containerRect: DOMRect
): MapTokenLayout {
    const defaultPosition = getMapTokenPosition(index, total);
    const centerXPct = Number.parseFloat(defaultPosition.left);
    const centerYPct = Number.parseFloat(defaultPosition.top);
    const widthPx = (containerRect.width * DEFAULT_TOKEN_WIDTH_PCT) / 100;
    const heightPx = getTokenTotalHeightPx(widthPx);
    const xPx = (containerRect.width * centerXPct) / 100 - widthPx / 2;
    const yPx = (containerRect.height * centerYPct) / 100 - heightPx / 2;
    const maxXPct = Math.max(
        0,
        ((containerRect.width - widthPx) / containerRect.width) * 100
    );
    const maxYPct = Math.max(
        0,
        ((containerRect.height - heightPx) / containerRect.height) * 100
    );

    return {
        xPct: clamp((xPx / containerRect.width) * 100, 0, maxXPct),
        yPct: clamp((yPx / containerRect.height) * 100, 0, maxYPct),
        widthPct: DEFAULT_TOKEN_WIDTH_PCT,
    };
}

function getBaseTokenId(characterId: string): string {
    return `base:${characterId}`;
}

function getCloneTokenId(characterId: string): string {
    return `clone:${characterId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

function createCloneTokenLayout(
    sourceLayout: MapTokenLayout,
    containerRect: DOMRect,
    cloneIndex: number
): MapTokenLayout {
    const sourceWidthPx = (sourceLayout.widthPct / 100) * containerRect.width;
    const sourceHeightPx = getTokenTotalHeightPx(sourceWidthPx);
    const sourceXPx = (sourceLayout.xPct / 100) * containerRect.width;
    const sourceYPx = (sourceLayout.yPct / 100) * containerRect.height;
    const offsetPatterns = [
        { x: 28, y: 18 },
        { x: 42, y: -10 },
        { x: 14, y: 34 },
        { x: 48, y: 22 },
        { x: 24, y: 42 },
    ];
    const offset = offsetPatterns[cloneIndex % offsetPatterns.length];
    const xPx = clamp(
        sourceXPx + offset.x,
        0,
        Math.max(0, containerRect.width - sourceWidthPx)
    );
    const yPx = clamp(
        sourceYPx + offset.y,
        0,
        Math.max(0, containerRect.height - sourceHeightPx)
    );

    return {
        xPct: (xPx / containerRect.width) * 100,
        yPct: (yPx / containerRect.height) * 100,
        widthPct: sourceLayout.widthPct,
    };
}

export default function MatchPage(): JSX.Element {
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId') ?? '';
    const router = useRouter();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const diceBoxHostRef = useRef<HTMLDivElement>(null);
    const diceBoxRef = useRef<DiceBoxThreejs | null>(null);
    const diceBoxInitPromiseRef = useRef<Promise<DiceBoxThreejs> | null>(null);
    const diceRollSessionIdRef = useRef(0);
    const activeTokenInteractionRef = useRef<ActiveTokenInteraction | null>(null);
    const suppressTokenClickIdRef = useRef<string | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<string>(
        SideImageBackground.src
    );
    const [sheetModalOpen, setSheetModalOpen] = useState(false);
    const [isMaster, setIsMaster] = useState(false);
    const [isPlayer, setIsPlayer] = useState(false);
    const [gridVisible, setGridVisible] = useState(true);
    const [diceTrayOpen, setDiceTrayOpen] = useState(false);
    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [effectsModalOpen, setEffectsModalOpen] = useState(false);
    const [avatarSelectionModalOpen, setAvatarSelectionModalOpen] = useState(false);
    const [journalHighlightModalOpen, setJournalHighlightModalOpen] = useState(false);
    const [journalHighlightReaderOpen, setJournalHighlightReaderOpen] = useState(false);
    const [journalHighlightNoticeOpen, setJournalHighlightNoticeOpen] = useState(false);
    const [resizeModeOpen, setResizeModeOpen] = useState(false);
    const [cloneModeOpen, setCloneModeOpen] = useState(false);
    const [activeEffect, setActiveEffect] = useState<MapEffect | null>(null);
    const [musics, setMusics] = useState<CampaignMusic[]>([]);
    const [mapImages, setMapImages] = useState<{ link: string }[]>([]);
    const [playingMusicId, setPlayingMusicId] = useState<string | null>(null);
    const [charPanelOpen, setCharPanelOpen] = useState(false);
    const [charPanelTab, setCharPanelTab] = useState<'resumo' | 'magias' | 'habilidades'>(
        'resumo'
    );
    const [campaignCharacters, setCampaignCharacters] = useState<CampaignCharacter[]>([]);
    const [campaignCharacterSummaries, setCampaignCharacterSummaries] = useState<
        Record<string, MapTokenSummary>
    >({});
    const [mapTokenLayoutById, setMapTokenLayoutById] = useState<
        Record<string, MapTokenLayout>
    >({});
    const [clonedMapTokens, setClonedMapTokens] = useState<MapTokenInstance[]>([]);
    const [visibleMapCharacterIds, setVisibleMapCharacterIds] = useState<string[]>([]);
    const [avatarSearch, setAvatarSearch] = useState('');
    const [journalPosts, setJournalPosts] = useState<JournalPost[]>([]);
    const [highlightedJournalPost, setHighlightedJournalPost] =
        useState<JournalPost | null>(null);
    const [myCharacters, setMyCharacters] = useState<CampaignCharacter[]>([]);
    const [selectedMapCharacterId, setSelectedMapCharacterId] = useState<string | null>(
        null
    );
    const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
    const [selectedCharacter, setSelectedCharacter] = useState<FullCharacterDnd | null>(
        null
    );
    const [characterLoading, setCharacterLoading] = useState(false);
    const [className, setClassName] = useState('');
    const [raceName, setRaceName] = useState('');
    const [spellNameMap, setSpellNameMap] = useState<Record<string, string>>({});
    const [journalPostsLoading, setJournalPostsLoading] = useState(false);
    const [journalHighlightLoading, setJournalHighlightLoading] = useState(false);
    const [journalHighlightSaving, setJournalHighlightSaving] = useState(false);
    const [journalHighlightError, setJournalHighlightError] = useState('');
    const [journalHighlightNoticeMessage, setJournalHighlightNoticeMessage] =
        useState('');
    const [activeTokenInteractionMeta, setActiveTokenInteractionMeta] = useState<{
        tokenId: string;
        type: TokenInteractionType;
    } | null>(null);

    const diceOptions = [
        { label: 'D20', icon: D20SVG, sides: 20 },
        { label: 'D12', icon: D12SVG, sides: 12 },
        { label: 'D10', icon: D10SVG, sides: 10 },
        { label: 'D8', icon: D8SVG, sides: 8 },
        { label: 'D6', icon: D6SVG, sides: 6 },
        { label: 'D4', icon: D4SVG, sides: 4 },
    ];

    const previousCampaignCharacterIdsRef = useRef<string[]>([]);
    const hasInitializedVisibleMapCharactersRef = useRef(false);
    const [dicePickerState, setDicePickerState] = useState<{
        sides: number;
        label: string;
        icon: string;
        count: number;
    } | null>(null);
    const [diceRollSession, setDiceRollSession] = useState<DiceRollSession>(
        createIdleDiceRollSession
    );

    const dismissDiceRoll = () => {
        diceRollSessionIdRef.current += 1;
        diceBoxRef.current?.clearDice();
        setDiceRollSession(createIdleDiceRollSession());
    };

    const handleDiceLayerClick = () => {
        if (diceRollSession.status !== 'settled') return;
        dismissDiceRoll();
    };

    const loadHighlightedJournalPost = async (options?: {
        suppressLoading?: boolean;
        suppressErrorState?: boolean;
    }): Promise<JournalPost | null> => {
        const shouldShowLoading = !options?.suppressLoading;
        const shouldSetErrorState = !options?.suppressErrorState;

        if (shouldShowLoading) {
            setJournalHighlightLoading(true);
        }

        if (shouldSetErrorState) {
            setJournalHighlightError('');
        }

        try {
            const recoveredHighlightedPost = await getCampaignHighlightedJournalPost(
                campaignId
            );
            setHighlightedJournalPost(recoveredHighlightedPost);
            return recoveredHighlightedPost;
        } catch (error: any) {
            const message = error?.message ?? 'Erro ao carregar publicação em destaque.';

            if (shouldSetErrorState) {
                setJournalHighlightError(message);
            }

            throw error;
        } finally {
            if (shouldShowLoading) {
                setJournalHighlightLoading(false);
            }
        }
    };

    const loadCampaignPosts = async (): Promise<JournalPost[]> => {
        setJournalPostsLoading(true);
        setJournalHighlightError('');

        try {
            const recoveredPosts = await getCampaignJournalPosts(campaignId);
            setJournalPosts(recoveredPosts);
            return recoveredPosts;
        } catch (error: any) {
            setJournalHighlightError(
                error?.message ?? 'Erro ao carregar publicações do jornal.'
            );
            return [];
        } finally {
            setJournalPostsLoading(false);
        }
    };

    const handleOpenJournalHighlightModal = async () => {
        setJournalHighlightModalOpen(true);
        setJournalHighlightError('');

        const requests: Promise<unknown>[] = [
            loadHighlightedJournalPost({ suppressErrorState: false }),
        ];

        if (journalPosts.length === 0) {
            requests.push(loadCampaignPosts());
        }

        await Promise.allSettled(requests);
    };

    const handleToggleJournalHighlight = async (post: JournalPost) => {
        setJournalHighlightSaving(true);
        setJournalHighlightError('');

        try {
            if (areJournalPostsEqual(highlightedJournalPost, post)) {
                await setCampaignHighlightedJournalPost(campaignId, {
                    toggle: 'off',
                });
                setHighlightedJournalPost(null);
                return;
            }

            await setCampaignHighlightedJournalPost(campaignId, {
                post,
                toggle: 'on',
            });
            setHighlightedJournalPost(post);
        } catch (error: any) {
            setJournalHighlightError(
                error?.message ?? 'Erro ao atualizar publicação em destaque.'
            );
        } finally {
            setJournalHighlightSaving(false);
        }
    };

    const handleOpenHighlightedJournalPost = async () => {
        setJournalHighlightError('');

        try {
            const currentHighlightedPost =
                highlightedJournalPost ??
                (await loadHighlightedJournalPost({
                    suppressErrorState: false,
                }));

            if (currentHighlightedPost) {
                setJournalHighlightReaderOpen(true);
                return;
            }

            setJournalHighlightNoticeMessage(
                'Nenhuma publicação em destaque no momento.'
            );
            setJournalHighlightNoticeOpen(true);
        } catch (error: any) {
            setJournalHighlightNoticeMessage(
                error?.message ?? 'Erro ao carregar publicação em destaque.'
            );
            setJournalHighlightNoticeOpen(true);
        }
    };

    const ensureDiceBox = async (): Promise<DiceBoxThreejs> => {
        if (diceBoxRef.current) {
            return diceBoxRef.current;
        }

        if (!diceBoxHostRef.current) {
            throw new Error('Dice box host is not mounted.');
        }

        if (!diceBoxInitPromiseRef.current) {
            diceBoxInitPromiseRef.current = (async () => {
                const box = new DiceBoxThreejs(`#${MATCH_DICE_BOX_HOST_ID}`, {
                    assetPath: '/assets/dice-box-threejs/',
                    sounds: false,
                    shadows: true,
                    gravity_multiplier: 400,
                    light_intensity: 0.7,
                    baseScale: 90,
                    strength: 1.2,
                    theme_colorset: 'black',
                    theme_material: 'glass',
                });

                await box.initialize();
                box.clearDice();
                diceBoxRef.current = box;
                return box;
            })().catch((error) => {
                diceBoxInitPromiseRef.current = null;
                throw error;
            });
        }

        return diceBoxInitPromiseRef.current;
    };

    const selectDie = (sides: number, label: string, iconSrc: string) => {
        setDicePickerState((prev) =>
            prev?.label === label ? null : { sides, label, icon: iconSrc, count: 1 }
        );
    };

    const rollDice = async () => {
        if (!dicePickerState || diceRollSession.status !== 'idle') return;
        const { count, sides, label } = dicePickerState;
        const notation = `${count}d${sides}`;
        const rollLabel = count > 1 ? `${count}${label}` : label;
        const sessionId = diceRollSessionIdRef.current + 1;

        diceRollSessionIdRef.current = sessionId;
        setDicePickerState(null);
        setDiceRollSession({
            status: 'rolling',
            label: rollLabel,
            count,
            notation,
            rolls: null,
            total: null,
        });

        try {
            const diceBox = await ensureDiceBox();
            const result: DiceBoxThreejsRollResult = await diceBox.roll(notation);

            if (diceRollSessionIdRef.current !== sessionId) return;

            const rolls = result.sets
                .flatMap((set) => set.rolls)
                .map((roll) => Number(roll.value))
                .filter((value) => Number.isFinite(value));
            const total = Number(result.total);

            setDiceRollSession({
                status: 'settled',
                label: rollLabel,
                count,
                notation,
                rolls,
                total,
            });
        } catch (error) {
            if (diceRollSessionIdRef.current === sessionId) {
                dismissDiceRoll();
            }
        }
    };

    const userInfo =
        typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('userLogged') as string)
            : null;

    useEffect(() => {
        return () => {
            diceRollSessionIdRef.current += 1;
            diceBoxRef.current?.clearDice();
            diceBoxHostRef.current?.replaceChildren();
        };
    }, []);

    useEffect(() => {
        if (!campaignId) return;
        getCampaignById(campaignId).then((data) => {
            const firstMap = data?.matchData?.mapImages?.[0]?.link;
            if (firstMap) setBackgroundImage(firstMap);
            setMusics(data?.musics ?? []);
            setMapImages(data?.matchData?.mapImages ?? []);
            if (data && userInfo?.userId) {
                const role = data.campaignPlayers?.find(
                    (p: { userId: string; role: string }) => p.userId === userInfo.userId
                )?.role;
                setIsMaster(role === 'dungeon_master');
                setIsPlayer(role === 'player' || role === 'admin_player');
            }
        });
    }, [campaignId]);

    useEffect(() => {
        if (!campaignId) return;
        getCharactersByCampaignLobby(campaignId).then((data) => {
            setCampaignCharacters(data);
        });
    }, [campaignId]);

    useEffect(() => {
        if (!campaignId) return;

        loadHighlightedJournalPost({
            suppressLoading: true,
            suppressErrorState: true,
        }).catch(() => null);
    }, [campaignId]);

    useEffect(() => {
        if (campaignCharacters.length === 0) {
            setCampaignCharacterSummaries({});
            setMapTokenLayoutById({});
            setVisibleMapCharacterIds([]);
            previousCampaignCharacterIdsRef.current = [];
            hasInitializedVisibleMapCharactersRef.current = false;
            return;
        }

        let isActive = true;

        Promise.all(
            campaignCharacters.map(async (character) => {
                const detail = await getCharacterById(character.id);

                return [
                    character.id,
                    {
                        currentHitPoints:
                            detail?.data?.stats?.hitPoints?.currentPoints ?? null,
                        level: detail?.data?.profile?.level ?? null,
                    },
                ] as const;
            })
        ).then((entries) => {
            if (!isActive) return;
            setCampaignCharacterSummaries(Object.fromEntries(entries));
        });

        return () => {
            isActive = false;
        };
    }, [campaignCharacters]);

    useEffect(() => {
        const validCharacterIds = new Set(
            campaignCharacters.map((character) => character.id)
        );

        setClonedMapTokens((previousClones) => {
            const nextClones = previousClones.filter(
                (token) =>
                    validCharacterIds.has(token.characterId) &&
                    visibleMapCharacterIds.includes(token.characterId)
            );

            return nextClones.length === previousClones.length
                ? previousClones
                : nextClones;
        });
    }, [campaignCharacters, visibleMapCharacterIds]);

    useEffect(() => {
        if (campaignCharacters.length === 0) {
            return;
        }

        const currentIds = campaignCharacters.map((character) => character.id);
        const previousIds = previousCampaignCharacterIdsRef.current;

        setVisibleMapCharacterIds((previousVisibleIds) => {
            if (!hasInitializedVisibleMapCharactersRef.current) {
                return currentIds;
            }

            const visibleSet = new Set(
                previousVisibleIds.filter((id) => currentIds.includes(id))
            );

            currentIds.forEach((id) => {
                if (!previousIds.includes(id)) {
                    visibleSet.add(id);
                }
            });

            return currentIds.filter((id) => visibleSet.has(id));
        });

        previousCampaignCharacterIdsRef.current = currentIds;
        hasInitializedVisibleMapCharactersRef.current = true;
    }, [campaignCharacters]);

    useEffect(() => {
        const visibleCharacters = campaignCharacters.filter((character) =>
            visibleMapCharacterIds.includes(character.id)
        );
        const tokenInstances: MapTokenInstance[] = [
            ...visibleCharacters.map((character) => ({
                tokenId: getBaseTokenId(character.id),
                characterId: character.id,
                isClone: false,
            })),
            ...clonedMapTokens.filter((token) =>
                visibleMapCharacterIds.includes(token.characterId)
            ),
        ];
        const container = mapContainerRef.current;

        if (!container) return;

        if (tokenInstances.length === 0) {
            setMapTokenLayoutById({});
            return;
        }

        const containerRect = container.getBoundingClientRect();

        setMapTokenLayoutById((previousLayouts) => {
            const nextLayouts: Record<string, MapTokenLayout> = {};

            tokenInstances.forEach((token, index) => {
                nextLayouts[token.tokenId] =
                    previousLayouts[token.tokenId] ??
                    createDefaultTokenLayout(index, tokenInstances.length, containerRect);
            });

            const previousKeys = Object.keys(previousLayouts);
            const nextKeys = Object.keys(nextLayouts);
            const keysChanged =
                previousKeys.length !== nextKeys.length ||
                previousKeys.some((key) => !nextLayouts[key]);

            if (!keysChanged) {
                const allSame = nextKeys.every(
                    (key) => previousLayouts[key] === nextLayouts[key]
                );
                if (allSame) {
                    return previousLayouts;
                }
            }

            return nextLayouts;
        });
    }, [campaignCharacters, visibleMapCharacterIds, clonedMapTokens]);

    useEffect(() => {
        if (!campaignId || !userInfo?.userId) return;
        getCharactersByPlayer(campaignId).then((data) => {
            const mine = data.filter((char) => char.authorUserId === userInfo.userId);
            setMyCharacters(mine);

            if (mine.length === 1) {
                setSelectedCharacterId(mine[0].id);
            }
        });
    }, [campaignId]);

    useEffect(() => {
        if (!selectedCharacterId) {
            setSelectedCharacter(null);
            setClassName('');
            setRaceName('');
            return;
        }

        setCharacterLoading(true);
        getCharacterById(selectedCharacterId)
            .then((data) => setSelectedCharacter(data))
            .finally(() => setCharacterLoading(false));
    }, [selectedCharacterId]);

    useEffect(() => {
        const classId = selectedCharacter?.data?.profile?.class;
        const raceId = selectedCharacter?.data?.profile?.race;

        if (!classId && !raceId) {
            setClassName('');
            setRaceName('');
            return;
        }

        Promise.all([
            classId ? getDnd5eClassById(classId) : Promise.resolve(null),
            raceId ? getDnd5eRaceById(raceId) : Promise.resolve(null),
        ]).then(([classData, raceData]) => {
            setClassName(classData?.pt?.name ?? '');
            setRaceName(raceData?.pt?.name ?? '');
        });
    }, [selectedCharacter?.data?.profile?.class, selectedCharacter?.data?.profile?.race]);

    useEffect(() => {
        const spellsData = (selectedCharacter?.data?.spells as any) ?? null;
        if (!spellsData) {
            setSpellNameMap({});
            return;
        }

        const ids: string[] = [];
        if (Array.isArray(spellsData.cantrips)) ids.push(...spellsData.cantrips);
        for (let level = 1; level <= 9; level++) {
            const levelIds = spellsData[level]?.spellIds;
            if (Array.isArray(levelIds)) ids.push(...levelIds);
        }

        const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
        if (uniqueIds.length === 0) {
            setSpellNameMap({});
            return;
        }

        Promise.all(uniqueIds.map((id) => getDnd5eSpellById(id))).then((results) => {
            const map: Record<string, string> = {};
            results.forEach((result: any, i: number) => {
                if (result?.pt?.name) map[uniqueIds[i]] = result.pt.name;
            });
            setSpellNameMap(map);
        });
    }, [selectedCharacter?.data?.spells]);

    const profile = selectedCharacter?.data?.profile;
    const stats = selectedCharacter?.data?.stats;
    const picture =
        profile?.picture?.link ??
        profile?.characteristics?.appearance?.picture?.link ??
        selectedCharacter?.picture?.link ??
        '/images/SideImageBackground.svg';
    const hp = stats?.hitPoints;
    const deathSaves = stats?.deathSaves;
    const money = selectedCharacter?.data?.money;

    const spellData = (selectedCharacter?.data?.spells as any) ?? null;
    const spellsByLevel: Array<{ label: string; items: string[]; slots?: string }> = [
        { label: 'Truques', items: spellData?.cantrips ?? [] },
        ...Array.from({ length: 9 }, (_, i) => {
            const level = i + 1;
            const levelData = spellData?.[level];
            return {
                label: `${level}º Círculo`,
                items: levelData?.spellIds ?? [],
                slots:
                    typeof levelData?.slotsTotal === 'number'
                        ? `${levelData.slotsExpended ?? 0}/${levelData.slotsTotal}`
                        : undefined,
            };
        }),
    ];

    const abilitiesData = (selectedCharacter?.data?.extraAbilities as any) ?? null;
    const abilitiesByLevel: Array<{ label: string; items: string[]; slots?: string }> = [
        { label: 'Truques', items: abilitiesData?.cantrips ?? [] },
        ...Array.from({ length: 9 }, (_, i) => {
            const level = i + 1;
            const levelData = abilitiesData?.[level];
            return {
                label: `${level}º Nível`,
                items: levelData?.extraAbilityNames ?? [],
                slots:
                    typeof levelData?.slotsTotal === 'number'
                        ? `${levelData.slotsExpended ?? 0}/${levelData.slotsTotal}`
                        : undefined,
            };
        }),
    ];
    const filteredCampaignCharacters = campaignCharacters.filter((character) =>
        visibleMapCharacterIds.includes(character.id)
    );
    const visibleMapTokenInstances: MapTokenInstance[] = [
        ...filteredCampaignCharacters.map((character) => ({
            tokenId: getBaseTokenId(character.id),
            characterId: character.id,
            isClone: false,
        })),
        ...clonedMapTokens.filter((token) =>
            visibleMapCharacterIds.includes(token.characterId)
        ),
    ];
    const campaignCharacterById = Object.fromEntries(
        campaignCharacters.map((character) => [character.id, character] as const)
    );
    const searchedCampaignCharacters = campaignCharacters.filter((character) =>
        character.name.toLowerCase().includes(avatarSearch.trim().toLowerCase())
    );

    useEffect(() => {
        if (!activeTokenInteractionMeta) {
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            const interaction = activeTokenInteractionRef.current;
            const container = mapContainerRef.current;
            if (!interaction || !container) return;

            const containerRect = container.getBoundingClientRect();
            const deltaX = event.clientX - interaction.startClientX;
            const deltaY = event.clientY - interaction.startClientY;

            if (
                Math.hypot(deltaX, deltaY) > DRAG_CLICK_THRESHOLD_PX &&
                !interaction.didMove
            ) {
                interaction.didMove = true;
            }

            setMapTokenLayoutById((previousLayouts) => {
                const currentLayout = previousLayouts[interaction.tokenId];
                if (!currentLayout) return previousLayouts;

                const nextLayouts = { ...previousLayouts };
                const startWidthPx =
                    (interaction.startWidthPct / 100) * containerRect.width;

                if (interaction.type === 'drag') {
                    const widthPx = (currentLayout.widthPct / 100) * containerRect.width;
                    const heightPx = getTokenTotalHeightPx(widthPx);
                    const nextXPx =
                        (interaction.startXPct / 100) * containerRect.width + deltaX;
                    const nextYPx =
                        (interaction.startYPct / 100) * containerRect.height + deltaY;
                    const maxXPx = Math.max(0, containerRect.width - widthPx);
                    const maxYPx = Math.max(0, containerRect.height - heightPx);

                    nextLayouts[interaction.tokenId] = {
                        ...currentLayout,
                        xPct: (clamp(nextXPx, 0, maxXPx) / containerRect.width) * 100,
                        yPct: (clamp(nextYPx, 0, maxYPx) / containerRect.height) * 100,
                    };

                    return nextLayouts;
                }

                const currentXPx = (interaction.startXPct / 100) * containerRect.width;
                const currentYPx = (interaction.startYPct / 100) * containerRect.height;
                const resizeDelta = Math.max(deltaX, deltaY / TOKEN_SHELL_ASPECT_RATIO);
                const maxWidthFromRightPx = containerRect.width - currentXPx;
                const maxWidthFromBottomPx = Math.max(
                    0,
                    (containerRect.height - currentYPx - TOKEN_INFO_HEIGHT_PX) /
                        TOKEN_SHELL_ASPECT_RATIO
                );
                const maxWidthPctFromBounds =
                    (Math.min(maxWidthFromRightPx, maxWidthFromBottomPx) /
                        containerRect.width) *
                    100;
                const nextWidthPct =
                    ((startWidthPx + resizeDelta) / containerRect.width) * 100;

                nextLayouts[interaction.tokenId] = {
                    ...currentLayout,
                    widthPct: clamp(
                        nextWidthPct,
                        MIN_TOKEN_WIDTH_PCT,
                        Math.max(
                            MIN_TOKEN_WIDTH_PCT,
                            Math.min(MAX_TOKEN_WIDTH_PCT, maxWidthPctFromBounds)
                        )
                    ),
                };

                return nextLayouts;
            });
        };

        const handlePointerEnd = () => {
            const interaction = activeTokenInteractionRef.current;
            if (interaction?.didMove) {
                suppressTokenClickIdRef.current = interaction.tokenId;
            }
            activeTokenInteractionRef.current = null;
            setActiveTokenInteractionMeta(null);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerEnd);
        window.addEventListener('pointercancel', handlePointerEnd);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerEnd);
            window.removeEventListener('pointercancel', handlePointerEnd);
        };
    }, [activeTokenInteractionMeta]);

    const startTokenInteraction = (
        type: TokenInteractionType,
        event: React.PointerEvent<HTMLElement>,
        tokenId: string
    ) => {
        if (event.button !== 0) return;
        if (type === 'resize' && !isMaster) return;

        const tokenLayout = mapTokenLayoutById[tokenId];
        if (!tokenLayout) return;

        event.preventDefault();
        event.stopPropagation();

        activeTokenInteractionRef.current = {
            type,
            tokenId,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startXPct: tokenLayout.xPct,
            startYPct: tokenLayout.yPct,
            startWidthPct: tokenLayout.widthPct,
            didMove: false,
        };
        setActiveTokenInteractionMeta({ tokenId, type });
    };

    const handleTokenClick = (token: MapTokenInstance, character: CampaignCharacter) => {
        if (suppressTokenClickIdRef.current) {
            const suppressedId = suppressTokenClickIdRef.current;
            suppressTokenClickIdRef.current = null;
            if (suppressedId === token.tokenId) {
                return;
            }
        }

        if (token.isClone || character.authorUserId !== userInfo?.userId) {
            setSelectedMapCharacterId(character.id);
        }
    };

    const handleCloneToken = (token: MapTokenInstance) => {
        const container = mapContainerRef.current;
        const sourceLayout = mapTokenLayoutById[token.tokenId];
        if (!container || !sourceLayout) return;

        const characterId = token.characterId;
        const cloneTokenId = getCloneTokenId(characterId);
        const cloneIndex =
            clonedMapTokens.filter((cloneToken) => cloneToken.characterId === characterId)
                .length + 1;
        const cloneLayout = createCloneTokenLayout(
            sourceLayout,
            container.getBoundingClientRect(),
            cloneIndex
        );

        setClonedMapTokens((current) => [
            ...current,
            {
                tokenId: cloneTokenId,
                characterId,
                isClone: true,
            },
        ]);
        setMapTokenLayoutById((current) => ({
            ...current,
            [cloneTokenId]: cloneLayout,
        }));
    };

    return (
        <div
            ref={mapContainerRef}
            className="match-page"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
            }}
        >
            {/* Grid overlay */}
            {gridVisible && <div className="match-grid" />}
            {(activeEffect === 'dark' || activeEffect === 'light') && (
                <MapFogOverlay variant={activeEffect as FogVariant} />
            )}
            {activeEffect === 'rain' && <MapRainOverlay />}

            {/* Top-left: Tablerise logo */}
            <div
                className="match-logo-badge cursor-pointer"
                onClick={() => router.push('/')}
            >
                <Image
                    src={LogoSVG.src}
                    alt="TableRise"
                    width={LogoSVG.width}
                    height={LogoSVG.height}
                />
            </div>

            {visibleMapTokenInstances.length > 0 && (
                <div className="match-map-tokens" aria-label="Personagens da campanha">
                    {visibleMapTokenInstances.map((token) => {
                        const character = campaignCharacterById[token.characterId];
                        if (!character) {
                            return null;
                        }

                        const summary = campaignCharacterSummaries[character.id];
                        const tokenLayout = mapTokenLayoutById[token.tokenId];
                        const isInspectable =
                            token.isClone || character.authorUserId !== userInfo?.userId;
                        const isActiveToken =
                            activeTokenInteractionMeta?.tokenId === token.tokenId;

                        if (!tokenLayout) {
                            return null;
                        }

                        return (
                            <div
                                key={token.tokenId}
                                className={`match-map-token${
                                    isInspectable ? ' match-map-token--inspectable' : ''
                                }${
                                    isActiveToken
                                        ? ` match-map-token--${activeTokenInteractionMeta?.type}`
                                        : ''
                                }`}
                                title={character.name}
                                style={{
                                    left: `${tokenLayout.xPct}%`,
                                    top: `${tokenLayout.yPct}%`,
                                    width: `${tokenLayout.widthPct}%`,
                                }}
                                onPointerDown={(event) =>
                                    startTokenInteraction('drag', event, token.tokenId)
                                }
                                onClick={() => handleTokenClick(token, character)}
                            >
                                <div className="match-map-token-shell">
                                    {isMaster && cloneModeOpen && (
                                        <button
                                            type="button"
                                            className="match-map-token-clone-handle"
                                            aria-label={`Duplicar ${character.name}`}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleCloneToken(token);
                                            }}
                                            onPointerDown={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                            }}
                                        >
                                            <span className="match-map-token-clone-icon">
                                                +
                                            </span>
                                        </button>
                                    )}
                                    <div className="match-map-token-frame">
                                        <div className="match-map-token-image">
                                            <Image
                                                src={
                                                    character.image ||
                                                    SideImageBackground.src
                                                }
                                                alt={character.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                    </div>
                                    {isMaster && resizeModeOpen && (
                                        <button
                                            type="button"
                                            className="match-map-token-resize-handle"
                                            aria-label={`Redimensionar ${character.name}`}
                                            onClick={(event) => event.stopPropagation()}
                                            onPointerDown={(event) =>
                                                startTokenInteraction(
                                                    'resize',
                                                    event,
                                                    token.tokenId
                                                )
                                            }
                                        >
                                            <span className="match-map-token-resize-icon">
                                                ↘
                                            </span>
                                        </button>
                                    )}
                                </div>
                                <span className="font-XXS-regular match-map-token-name">
                                    {character.name}
                                </span>
                                <div className="match-map-token-meta">
                                    <span className="font-XXS-regular match-map-token-stat">
                                        &#9829; {summary?.currentHitPoints ?? '-'}
                                    </span>
                                    <span className="font-XXS-regular match-map-token-stat">
                                        <strong>LVL</strong> {summary?.level ?? '-'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Middle-left: character panel toggle + drawer */}
            <div className="match-char-panel-anchor">
                <button
                    className="match-char-panel-toggle"
                    title="Abrir resumo do personagem"
                    onClick={() => setCharPanelOpen((v) => !v)}
                >
                    <Image
                        src={LeftPanelOpenSVG.src}
                        alt="Painel de personagem"
                        width={30}
                        height={30}
                    />
                </button>

                <aside
                    className={`match-char-panel${
                        charPanelOpen ? ' match-char-panel--open' : ''
                    }`}
                >
                    <div className="match-char-panel-header">
                        <h3 className="font-S-bold">Resumo da Ficha</h3>
                        <button
                            className="match-char-panel-open-sheet font-XXS-bold"
                            onClick={() => setSheetModalOpen(true)}
                        >
                            Abrir ficha completa
                        </button>
                    </div>

                    {myCharacters.length === 0 && (
                        <span className="font-XS-regular match-char-empty">
                            Você não tem um personagem
                        </span>
                    )}

                    {myCharacters.length > 1 && (
                        <select
                            className="match-char-select font-XS-regular"
                            value={selectedCharacterId}
                            onChange={(e) => setSelectedCharacterId(e.target.value)}
                        >
                            <option value="">Selecione um personagem</option>
                            {myCharacters.map((char) => (
                                <option key={char.id} value={char.id}>
                                    {char.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {myCharacters.length === 1 && (
                        <span className="match-char-single-name font-XS-bold">
                            {myCharacters[0].name}
                        </span>
                    )}

                    {characterLoading && (
                        <span className="font-XS-regular match-char-empty">
                            Carregando personagem...
                        </span>
                    )}

                    {!characterLoading && selectedCharacter && profile && stats && (
                        <>
                            <div className="match-char-tabs">
                                <button
                                    className={`match-char-tab font-XXS-bold${
                                        charPanelTab === 'resumo'
                                            ? ' match-char-tab--active'
                                            : ''
                                    }`}
                                    onClick={() => setCharPanelTab('resumo')}
                                >
                                    Resumo
                                </button>
                                <button
                                    className={`match-char-tab font-XXS-bold${
                                        charPanelTab === 'magias'
                                            ? ' match-char-tab--active'
                                            : ''
                                    }`}
                                    onClick={() => setCharPanelTab('magias')}
                                >
                                    Magias
                                </button>
                                <button
                                    className={`match-char-tab font-XXS-bold${
                                        charPanelTab === 'habilidades'
                                            ? ' match-char-tab--active'
                                            : ''
                                    }`}
                                    onClick={() => setCharPanelTab('habilidades')}
                                >
                                    Habilidades
                                </button>
                            </div>

                            {charPanelTab === 'resumo' && (
                                <div className="match-char-content">
                                    <div className="match-char-profile">
                                        <div className="match-char-avatar">
                                            <Image
                                                src={picture || SideImageBackground.src}
                                                alt={profile.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-XS-bold">{profile.name}</p>
                                            <p className="font-XXS-regular">
                                                {className || profile.class} •{' '}
                                                {raceName || profile.race}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="match-char-grid-two">
                                        <span className="font-XXS-regular">
                                            Vida Total: <b>{hp?.points ?? 0}</b>
                                        </span>
                                        <span className="font-XXS-regular">
                                            Vida Atual: <b>{hp?.currentPoints ?? 0}</b>
                                        </span>
                                        <span className="font-XXS-regular">
                                            Vida Temporária: <b>{hp?.tempPoints ?? 0}</b>
                                        </span>
                                        <span className="font-XXS-regular">
                                            Nível: <b>{profile.level ?? 0}</b>
                                        </span>
                                        <span className="font-XXS-regular">
                                            XP: <b>{profile.xp ?? 0}</b>
                                        </span>
                                        <span className="font-XXS-regular">
                                            Testes de Morte:{' '}
                                            <b>{deathSaves?.success ?? 0}</b>/
                                            <b>{deathSaves?.failures ?? 0}</b>
                                        </span>
                                        <span className="font-XXS-regular">
                                            Dinheiro: <b>{money?.gp ?? 0} PO</b>
                                        </span>
                                        <span className="font-XXS-regular">
                                            Bonus de proficiência:{' '}
                                            <b>{stats.proficiencyBonus ?? 0}</b>
                                        </span>
                                    </div>

                                    <div className="match-char-section">
                                        <p className="font-XXS-bold">Ability Scores</p>
                                        <div className="match-char-tags">
                                            {stats.abilityScores.map((ability) => (
                                                <span
                                                    key={ability.ability}
                                                    className="match-char-tag font-XXS-regular"
                                                >
                                                    {ABILITY_LABELS[ability.ability] ||
                                                        ability.ability.toUpperCase()}
                                                    : {ability.value} (
                                                    {signed(ability.modifier)})
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {(stats.skills?.length ?? 0) > 0 && (
                                        <div className="match-char-section">
                                            <p className="font-XXS-bold">Perícias</p>
                                            <div className="match-char-tags">
                                                {(stats.skills ?? [])
                                                    .filter((sk) => sk.checked)
                                                    .map((sk) => (
                                                        <span
                                                            key={sk.name}
                                                            className="match-char-tag font-XXS-regular"
                                                        >
                                                            {SKILL_LABELS[sk.name] ||
                                                                sk.name}
                                                            : {signed(sk.value)}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="match-char-section">
                                        <p className="font-XXS-bold">
                                            Testes de resistência
                                        </p>
                                        <div className="match-char-tags">
                                            {stats.abilityScores
                                                .filter((ability) => ability.proficiency)
                                                .map((ability) => (
                                                    <span
                                                        key={ability.ability}
                                                        className="match-char-tag font-XXS-regular"
                                                    >
                                                        {ability.ability.toUpperCase()}:{' '}
                                                        {ability.modifier >= 0 ? '+' : ''}
                                                        {ability.modifier}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {charPanelTab === 'magias' && (
                                <div className="match-char-content">
                                    {spellsByLevel.map((level) => (
                                        <div
                                            key={level.label}
                                            className="match-char-section"
                                        >
                                            <p className="font-XXS-bold">
                                                {level.label}
                                                {level.slots
                                                    ? ` • Slots ${level.slots}`
                                                    : ''}
                                            </p>
                                            <p className="font-XXS-regular">
                                                {level.items.length > 0
                                                    ? level.items
                                                          .map(
                                                              (spellId) =>
                                                                  spellNameMap[spellId] ||
                                                                  spellId
                                                          )
                                                          .join(', ')
                                                    : 'Sem magias'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {charPanelTab === 'habilidades' && (
                                <div className="match-char-content">
                                    {abilitiesByLevel.map((level) => (
                                        <div
                                            key={level.label}
                                            className="match-char-section"
                                        >
                                            <p className="font-XXS-bold">
                                                {level.label}
                                                {level.slots
                                                    ? ` • Slots ${level.slots}`
                                                    : ''}
                                            </p>
                                            <p className="font-XXS-regular">
                                                {level.items.length > 0
                                                    ? level.items.join(', ')
                                                    : 'Sem habilidades'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </aside>
            </div>

            {/* Top-right: horizontal action bar */}
            {isMaster && (
                <nav className="match-top-bar">
                    <button
                        className={`match-top-bar-item${
                            resizeModeOpen ? ' match-top-bar-item--active' : ''
                        }`}
                        title={
                            resizeModeOpen
                                ? 'Encerrar redimensionamento'
                                : 'Redimensionar avatares'
                        }
                        onClick={() => {
                            setResizeModeOpen((current) => {
                                const nextValue = !current;
                                if (nextValue) {
                                    setCloneModeOpen(false);
                                }
                                return nextValue;
                            });
                        }}
                    >
                        <Image
                            src={ResizeBlueSVG.src}
                            alt="Redimensionar avatares"
                            width={28}
                            height={28}
                        />
                    </button>
                    <button
                        className={`match-top-bar-item${
                            cloneModeOpen ? ' match-top-bar-item--active' : ''
                        }`}
                        title={
                            cloneModeOpen ? 'Encerrar duplicacao' : 'Duplicar avatares'
                        }
                        onClick={() => {
                            setCloneModeOpen((current) => {
                                const nextValue = !current;
                                if (nextValue) {
                                    setResizeModeOpen(false);
                                }
                                return nextValue;
                            });
                        }}
                    >
                        <Image
                            src={CloneSVG.src}
                            alt="Duplicar avatares"
                            width={28}
                            height={28}
                        />
                    </button>
                    <button
                        className={`match-top-bar-item${
                            journalHighlightModalOpen ? ' match-top-bar-item--active' : ''
                        }`}
                        title="Destaque do jornal"
                        onClick={handleOpenJournalHighlightModal}
                    >
                        <Image
                            src={BookmarkSVG.src}
                            alt="Destaque do jornal"
                            width={28}
                            height={28}
                        />
                    </button>
                    <button
                        className="match-top-bar-item"
                        title="Selecao de avatares"
                        onClick={() => setAvatarSelectionModalOpen(true)}
                    >
                        <Image
                            src={AvatarSelectionSVG.src}
                            alt="Selecao de avatares"
                            width={28}
                            height={28}
                        />
                    </button>
                    <button
                        className="match-top-bar-item"
                        title="Efeitos de mapa"
                        onClick={() => setEffectsModalOpen(true)}
                    >
                        <Image
                            src={StarBlueSVG.src}
                            alt="Efeitos de mapa"
                            width={28}
                            height={28}
                        />
                    </button>
                    <button
                        className="match-top-bar-item"
                        title="Anotações"
                        onClick={() => setNotesModalOpen(true)}
                    >
                        <Image
                            src={NotesBlueSVG.src}
                            alt="Anotações"
                            width={28}
                            height={28}
                        />
                    </button>
                    <button
                        className="match-top-bar-item"
                        title="Mídia"
                        onClick={() => setMediaModalOpen(true)}
                    >
                        <Image src={MediaSVG.src} alt="Mídia" width={28} height={28} />
                    </button>
                    <button
                        className="match-top-bar-item"
                        title={gridVisible ? 'Ocultar grid' : 'Mostrar grid'}
                        onClick={() => setGridVisible((v) => !v)}
                    >
                        <Image
                            src={gridVisible ? GridOffSVG.src : GridOnSVG.src}
                            alt="Grid"
                            width={28}
                            height={28}
                        />
                    </button>
                    <button
                        className="match-top-bar-item"
                        title="Fichas"
                        onClick={() => setSheetModalOpen(true)}
                    >
                        <Image src={SheetSVG.src} alt="Fichas" width={32} height={32} />
                    </button>
                </nav>
            )}

            {/* Bottom-left: vertical action bar */}
            <nav className="match-bottom-bar">
                <button
                    className="match-bottom-bar-item"
                    title="Publicação em destaque"
                    onClick={handleOpenHighlightedJournalPost}
                >
                    <Image
                        src={BookmarkSVG.src}
                        alt="Publicação em destaque"
                        width={28}
                        height={28}
                    />
                </button>
                {isPlayer && (
                    <button
                        className="match-bottom-bar-item"
                        title="Anotações"
                        onClick={() => setNotesModalOpen(true)}
                    >
                        <Image
                            src={NotesBlueSVG.src}
                            alt="Anotações"
                            width={28}
                            height={28}
                        />
                    </button>
                )}
                <button
                    className="match-bottom-bar-item match-bottom-bar-item--danger"
                    title="Sair da Partida"
                    onClick={() =>
                        router.push(`/campaigns/lobby?campaignId=${campaignId}`)
                    }
                >
                    <Image src={ExitRedSVG.src} alt="Sair" width={28} height={28} />
                </button>
            </nav>

            {/* Bottom-right: dice tray + picker + button */}
            <div className="match-dice-wrapper">
                <AnimatePresence>
                    {dicePickerState && (
                        <motion.div
                            className="match-dice-picker"
                            initial={{ opacity: 0, x: 16, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 16, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Image
                                src={dicePickerState.icon}
                                alt={dicePickerState.label}
                                width={56}
                                height={56}
                            />
                            <span className="match-dice-picker-label font-XXS-bold">
                                {dicePickerState.label}
                            </span>
                            <div className="match-dice-picker-counter">
                                <button
                                    className="match-dice-picker-counter-btn font-S-bold"
                                    onClick={() =>
                                        setDicePickerState((prev) =>
                                            prev
                                                ? {
                                                      ...prev,
                                                      count: Math.max(1, prev.count - 1),
                                                  }
                                                : null
                                        )
                                    }
                                >
                                    −
                                </button>
                                <span className="match-dice-picker-count font-S-bold">
                                    {dicePickerState.count}
                                </span>
                                <button
                                    className="match-dice-picker-counter-btn font-S-bold"
                                    onClick={() =>
                                        setDicePickerState((prev) =>
                                            prev
                                                ? {
                                                      ...prev,
                                                      count: Math.min(20, prev.count + 1),
                                                  }
                                                : null
                                        )
                                    }
                                >
                                    +
                                </button>
                            </div>
                            <button
                                className="match-dice-picker-roll-btn font-XXS-bold"
                                onClick={rollDice}
                            >
                                Rolar
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="match-dice-controls">
                    <div
                        className={`match-dice-tray${
                            diceTrayOpen ? ' match-dice-tray--open' : ''
                        }`}
                    >
                        {diceOptions.map(({ label, icon, sides }) => (
                            <button
                                key={label}
                                className={`match-dice-tray-item${
                                    dicePickerState?.label === label
                                        ? ' match-dice-tray-item--active'
                                        : ''
                                }`}
                                title={label}
                                onClick={() => selectDie(sides, label, icon.src)}
                            >
                                <Image
                                    src={icon.src}
                                    alt={label}
                                    width={36}
                                    height={36}
                                />
                            </button>
                        ))}
                    </div>
                    <button
                        className="match-dice-btn"
                        title="Dados"
                        onClick={() => {
                            if (diceTrayOpen) setDicePickerState(null);
                            setDiceTrayOpen((v) => !v);
                        }}
                    >
                        <Image src={DiceSVG.src} alt="Dado" width={48} height={48} />
                    </button>
                </div>
            </div>

            {/* Full-screen 3D dice layer */}
            <div
                className={`match-dice-layer${
                    diceRollSession.status !== 'idle' ? ' match-dice-layer--active' : ''
                }`}
                onClick={handleDiceLayerClick}
                aria-hidden={diceRollSession.status === 'idle'}
            >
                <div className="match-dice-layer-backdrop" />
                <div
                    ref={diceBoxHostRef}
                    id={MATCH_DICE_BOX_HOST_ID}
                    className="match-dice-box-host"
                />
                {diceRollSession.status === 'settled' &&
                    diceRollSession.total !== null && (
                        <div className="match-throw-ui">
                            <div className="match-throw-card">
                                <span
                                    className="match-throw-result font-XL-bold"
                                    style={{
                                        fontSize:
                                            (diceRollSession.total ?? 0) >= 100
                                                ? '2rem'
                                                : '3.5rem',
                                    }}
                                >
                                    {diceRollSession.total}
                                </span>
                                <div className="match-throw-details">
                                    <span className="match-throw-label font-S-bold">
                                        {diceRollSession.label}
                                    </span>
                                    {(diceRollSession.rolls?.length ?? 0) > 1 && (
                                        <div className="match-throw-rolls">
                                            {diceRollSession.rolls!.map((roll, index) => (
                                                <span
                                                    key={`${diceRollSession.notation}-${index}`}
                                                    className="match-throw-roll-badge font-XXS-bold"
                                                >
                                                    {roll}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <span className="match-throw-close font-XXS-bold">
                                        Clique para fechar
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
            </div>

            {sheetModalOpen && campaignId && userInfo?.userId && (
                <CharacterSheetModal
                    campaignId={campaignId}
                    userId={userInfo.userId}
                    isPlayer={isPlayer}
                    isMaster={isMaster}
                    onClose={() => setSheetModalOpen(false)}
                />
            )}

            {selectedMapCharacterId && campaignId && (
                <CharacterDetailModal
                    characterId={selectedMapCharacterId}
                    campaignId={campaignId}
                    isMaster={isMaster}
                    onBack={() => setSelectedMapCharacterId(null)}
                />
            )}

            {mediaModalOpen && (
                <MatchMediaModal
                    musics={musics}
                    mapImages={mapImages}
                    selectedMusic={playingMusicId}
                    onMusicSelect={(id) =>
                        setPlayingMusicId((prev) => (prev === id ? null : id))
                    }
                    onClose={() => setMediaModalOpen(false)}
                    onMapSelect={(link) => setBackgroundImage(link)}
                />
            )}

            {notesModalOpen && campaignId && userInfo?.userId && (
                <MatchNotesModal
                    campaignId={campaignId}
                    userId={userInfo.userId}
                    onClose={() => setNotesModalOpen(false)}
                />
            )}

            {effectsModalOpen && (
                <MatchEffectsModal
                    activeEffect={activeEffect}
                    onClose={() => setEffectsModalOpen(false)}
                    onToggleEffect={(effect) =>
                        setActiveEffect((current) => (current === effect ? null : effect))
                    }
                />
            )}

            {avatarSelectionModalOpen && (
                <MatchAvatarSelectionModal
                    characters={searchedCampaignCharacters}
                    searchValue={avatarSearch}
                    visibleCharacterIds={visibleMapCharacterIds}
                    onClose={() => setAvatarSelectionModalOpen(false)}
                    onSearchChange={setAvatarSearch}
                    onToggleCharacter={(characterId) =>
                        setVisibleMapCharacterIds((current) =>
                            current.includes(characterId)
                                ? current.filter((id) => id !== characterId)
                                : [...current, characterId]
                        )
                    }
                />
            )}

            {journalHighlightModalOpen && (
                <div
                    className="match-journal-highlight-overlay"
                    onClick={() => {
                        if (journalHighlightSaving) return;
                        setJournalHighlightModalOpen(false);
                    }}
                >
                    <div
                        className="match-journal-highlight-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="match-journal-highlight-header">
                            <div>
                                <h2 className="font-L-bold match-journal-highlight-title">
                                    Destaque do Jornal
                                </h2>
                                <p className="font-XXS-regular match-journal-highlight-subtitle">
                                    Selecione uma publicação para destacar aos jogadores.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="match-journal-highlight-close"
                                onClick={() => setJournalHighlightModalOpen(false)}
                                aria-label="Fechar"
                                disabled={journalHighlightSaving}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="match-journal-highlight-divider" />
                        <div className="match-journal-highlight-body">
                            {journalHighlightLoading || journalPostsLoading ? (
                                <span className="font-XS-regular match-journal-highlight-empty">
                                    Carregando publicaÃ§Ãµes...
                                </span>
                            ) : journalPosts.length === 0 ? (
                                <span className="font-XS-regular match-journal-highlight-empty">
                                    Nenhuma publicação encontrada para esta campanha.
                                </span>
                            ) : (
                                <div className="match-journal-highlight-list">
                                    {journalPosts.map((post, index) => {
                                        const isSelected = areJournalPostsEqual(
                                            highlightedJournalPost,
                                            post
                                        );

                                        return (
                                            <button
                                                key={`${post.title}-${post.timestamp}-${index}`}
                                                type="button"
                                                className={`match-journal-highlight-option${
                                                    isSelected
                                                        ? ' match-journal-highlight-option--active'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    handleToggleJournalHighlight(post)
                                                }
                                                disabled={journalHighlightSaving}
                                            >
                                                <span className="font-S-bold match-journal-highlight-option-title">
                                                    {post.title}
                                                </span>
                                                <span className="font-XXS-bold match-journal-highlight-option-state">
                                                    {isSelected
                                                        ? 'Em destaque'
                                                        : 'Selecionar'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {journalHighlightError && (
                                <span className="font-XS-regular match-journal-highlight-error">
                                    {journalHighlightError}
                                </span>
                            )}
                        </div>
                        <div className="match-journal-highlight-footer">
                            <span className="font-XXS-regular match-journal-highlight-footer-text">
                                {journalHighlightSaving
                                    ? 'Salvando destaque...'
                                    : 'Clique novamente em uma publicação destacada para remove-la.'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {journalHighlightNoticeOpen && (
                <div
                    className="match-journal-highlight-overlay"
                    onClick={() => setJournalHighlightNoticeOpen(false)}
                >
                    <div
                        className="match-journal-highlight-notice"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 className="font-L-bold match-journal-highlight-title">
                            Publicação em Destaque
                        </h2>
                        <p className="font-XS-regular match-journal-highlight-notice-text">
                            {journalHighlightNoticeMessage}
                        </p>
                        <button
                            type="button"
                            className="match-journal-highlight-notice-btn font-XS-bold"
                            onClick={() => setJournalHighlightNoticeOpen(false)}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {journalHighlightReaderOpen && highlightedJournalPost && (
                <JournalPostModal
                    post={highlightedJournalPost}
                    onClose={() => setJournalHighlightReaderOpen(false)}
                />
            )}

            {/* Persistent YouTube player (hidden) */}
            {playingMusicId && (
                <iframe
                    key={playingMusicId}
                    src={`https://www.youtube.com/embed/${playingMusicId}?autoplay=1&loop=1&playlist=${playingMusicId}`}
                    allow="autoplay; encrypted-media"
                    className="hidden"
                />
            )}
        </div>
    );
}
