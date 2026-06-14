/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';
import DiceBoxThreejs from '@3d-dice/dice-box-threejs';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LoadingDots from '@/components/common/LoadingDots';
import RankedAvatarFrame from '@/components/common/RankedAvatarFrame';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';
import TableriseContext from '@/context/TableriseContext';
import { getCampaignById } from '@/server/campaigns/join-campaign';
import { getUser } from '@/server/users/get-user';
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
import { getDnd5eClassById, getDnd5eSpellById } from '@/server/dungeons&dragons5e/system';
import CharacterSheetModal from '@/components/lobby/CharacterSheetModal';
import CharacterDetailModal from '@/components/lobby/CharacterDetailModal';
import JournalPostModal from '@/components/lobby/JournalPostModal';
import MatchEffectsModal, { type MapEffect } from '@/components/match/MatchEffectsModal';
import MatchAvatarSelectionModal from '@/components/match/MatchAvatarSelectionModal';
import MapFogOverlay, { type FogVariant } from '@/components/match/MapFogOverlay';
import MapRainOverlay from '@/components/match/MapRainOverlay';
import MatchMediaModal from '@/components/lobby/MatchMediaModal';
import MatchNotesModal from '@/components/match/MatchNotesModal';
import MatchImageHighlightManagerModal from '@/components/match/MatchImageHighlightManagerModal';
import MatchImageHighlightViewerModal from '@/components/match/MatchImageHighlightViewerModal';
import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import {
    setMatchHighlightedImage,
    uploadMatchHighlightImages,
} from '@/server/campaigns/match-image-highlight';
import {
    disconnectCampaignSocket,
    emitCampaignSocketAck,
    getCampaignSocket,
    type CampaignSocket,
} from '@/utils/campaignSocket';
import type {
    CampaignImagesUpdatedPayload,
    CampaignMapsUpdatedPayload,
    CampaignMusicsUpdatedPayload,
    CampaignSyncPayload,
    CharacterUpdatedPayload,
    DiceRollResolvedPayload,
    MatchImageHighlightedChangedPayload,
    MatchToken,
    SocketJournal,
    TokenBatchUpdatedPayload,
    TokenBatchWrappedPayload,
    TokenDeletedPayload,
    TokenWrappedPayload,
} from '@/types/shared/socket';
import type { ImageObject } from '@/types/shared/general';
import type { UploadImageValue } from '@/utils/imageUploadPayload';
import LogoLightSVG from '../../../../assets/icons/logo-blue.svg?url';
import LogoDarkSVG from '../../../../assets/icons/logo-dark.svg?url';
import SheetLightSVG from '../../../../assets/icons/menu-panel-lobby/sheet.svg?url';
import SheetDarkSVG from '../../../../assets/icons/menu-panel-lobby/sheet-dark.svg?url';
import MediaLightSVG from '../../../../assets/icons/menu-panel-lobby/media.svg?url';
import MediaDarkSVG from '../../../../assets/icons/menu-panel-lobby/media-dark.svg?url';
import LeftPanelOpenLightSVG from '../../../../assets/icons/game/left-panel-open.svg?url';
import LeftPanelOpenDarkSVG from '../../../../assets/icons/game/left-panel-open-dark.svg?url';
import EditLightSVG from '../../../../assets/icons/sys/edit-blue.svg?url';
import EditDarkSVG from '../../../../assets/icons/sys/edit-dark.svg?url';
import StarLightSVG from '../../../../assets/icons/game/star-blue.svg?url';
import StarDarkSVG from '../../../../assets/icons/game/star-dark.svg?url';
import AvatarSelectionLightSVG from '../../../../assets/icons/game/avatar-selection.svg?url';
import AvatarSelectionDarkSVG from '../../../../assets/icons/game/avatar-selection-dark.svg?url';
import ResizeLightSVG from '../../../../assets/icons/game/resize-blue.svg?url';
import ResizeDarkSVG from '../../../../assets/icons/game/resize-dark.svg?url';
import CloneLightSVG from '../../../../assets/icons/game/clone.svg?url';
import CloneDarkSVG from '../../../../assets/icons/game/clone-dark.svg?url';
import ImageHighlightLightSVG from '../../../../assets/icons/game/image-highlight-blue-light.svg?url';
import ImageHighlightDarkSVG from '../../../../assets/icons/game/image-highlight-blue-dark.svg?url';
import BookmarkLightSVG from '../../../../assets/icons/game/bookmark.svg?url';
import BookmarkDarkSVG from '../../../../assets/icons/game/bookmark-dark.svg?url';
import VolumeLightSVG from '../../../../assets/icons/game/volume.svg?url';
import VolumeDarkSVG from '../../../../assets/icons/game/volume-dark.svg?url';
import DiceLightSVG from '../../../../assets/icons/dice/default.svg?url';
import DiceDarkSVG from '../../../../assets/icons/dice/default-dark.svg?url';
import D4LightSVG from '../../../../assets/icons/dice/d4.svg?url';
import D4DarkSVG from '../../../../assets/icons/dice/d4-dark.svg?url';
import D6LightSVG from '../../../../assets/icons/dice/d6.svg?url';
import D6DarkSVG from '../../../../assets/icons/dice/d6-dark.svg?url';
import D8LightSVG from '../../../../assets/icons/dice/d8.svg?url';
import D8DarkSVG from '../../../../assets/icons/dice/d8-dark.svg?url';
import D10LightSVG from '../../../../assets/icons/dice/d10.svg?url';
import D10DarkSVG from '../../../../assets/icons/dice/d10-dark.svg?url';
import D12LightSVG from '../../../../assets/icons/dice/d12.svg?url';
import D12DarkSVG from '../../../../assets/icons/dice/d12-dark.svg?url';
import D20LightSVG from '../../../../assets/icons/dice/d20.svg?url';
import D20DarkSVG from '../../../../assets/icons/dice/d20-dark.svg?url';
import ExitRedSVG from '../../../../assets/icons/sys/exit-red.svg?url';
import WhiteRotateSVG from '../../../../assets/icons/sys/white-rotate.svg?url';
import GridOffLightSVG from '../../../../assets/icons/nav/grid-off-blue.svg?url';
import GridOffDarkSVG from '../../../../assets/icons/nav/grid-off-dark.svg?url';
import GridOnLightSVG from '../../../../assets/icons/nav/grind-on-blue.svg?url';
import GridOnDarkSVG from '../../../../assets/icons/nav/grind-on-dark.svg?url';
import SideImageBackground from '../../../../public/images/SideImageBackground.svg?url';
import { useStoredUser } from '@/hooks/useStoredUser';
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

const CURRENCY_LABELS: Record<'cp' | 'sp' | 'ep' | 'gp' | 'pp', string> = {
    cp: 'PC',
    sp: 'PP',
    ep: 'PE',
    gp: 'PO',
    pp: 'PL',
};

const MIN_TOKEN_WIDTH_PCT = 4.5;
const DEFAULT_TOKEN_WIDTH_PCT = MIN_TOKEN_WIDTH_PCT;
const MAX_TOKEN_WIDTH_PCT = 14;
const TOKEN_SHELL_ASPECT_RATIO = 56 / 52;
const TOKEN_INFO_HEIGHT_PX = 44;
const DRAG_CLICK_THRESHOLD_PX = 6;
const MATCH_DICE_BOX_HOST_ID = 'match-dice-box-host';

function requiresLandscapeViewportOnDevice(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

function getUserRank(user: any): string | undefined {
    const rank =
        user?.rank ??
        user?.details?.rank ??
        user?.result?.rank ??
        user?.result?.details?.rank;

    return typeof rank === 'string' ? rank : undefined;
}

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

interface CloneLifeEditorState {
    tokenId: string;
    characterName: string;
}

interface MatchDataWithImageHighlight {
    images?: ImageObject[];
    imageHighlighted?: ImageObject | null;
    imageHighlight?: ImageObject | null;
    mapImages?: ImageObject[];
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

function getCharacterIdFromBaseTokenId(tokenId: string): string | null {
    return tokenId.startsWith('base:') ? tokenId.slice(5) : null;
}

function getUniqueSpellIds(spellsData: any): string[] {
    if (!spellsData) {
        return [];
    }

    const ids: string[] = [];

    if (Array.isArray(spellsData.cantrips)) {
        ids.push(...spellsData.cantrips);
    }

    for (let level = 1; level <= 9; level++) {
        const levelIds = spellsData[level]?.spellIds;
        if (Array.isArray(levelIds)) {
            ids.push(...levelIds);
        }
    }

    return Array.from(new Set(ids.filter(Boolean)));
}

function normalizeHighlightedJournalPostPayload(payload: {
    highlightedJournalPost?: JournalPost | null;
}): JournalPost | null {
    return payload.highlightedJournalPost ?? null;
}

export default function MatchPage(): JSX.Element {
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId') ?? '';
    const router = useRouter();
    const { themeMode } = useContext(TableriseContext);
    const { storedUser: userInfo, hasResolvedStoredUser } = useStoredUser();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const campaignSocketRef = useRef<CampaignSocket | null>(null);
    const diceBoxHostRef = useRef<HTMLDivElement>(null);
    const diceBoxRef = useRef<DiceBoxThreejs | null>(null);
    const diceBoxInitPromiseRef = useRef<Promise<DiceBoxThreejs> | null>(null);
    const diceRollSessionIdRef = useRef(0);
    const activeTokenInteractionRef = useRef<ActiveTokenInteraction | null>(null);
    const suppressTokenClickIdRef = useRef<string | null>(null);
    const tokenBatchSyncTimeoutRef = useRef<number | null>(null);
    const pendingTokenSocketUpdatesRef = useRef<
        Record<string, { tokenId: string; xPct: number; yPct: number; widthPct: number }>
    >({});
    const musicPlayerFrameRef = useRef<HTMLIFrameElement | null>(null);
    const hasHydratedMatchSyncRef = useRef(false);
    const hasAppliedVisibleCharacterSyncRef = useRef(false);
    const selectedCharacterIdRef = useRef('');
    const selectedMapCharacterIdRef = useRef<string | null>(null);
    const mapTokenLayoutByIdRef = useRef<Record<string, MapTokenLayout>>({});
    const [backgroundImage, setBackgroundImage] = useState<string>(
        SideImageBackground.src
    );
    const [requiresLandscapeViewport, setRequiresLandscapeViewport] = useState<boolean>(
        () => requiresLandscapeViewportOnDevice()
    );
    const [isLandscapeViewport, setIsLandscapeViewport] = useState<boolean>(() => {
        if (typeof window === 'undefined') {
            return true;
        }

        return window.innerWidth >= window.innerHeight;
    });
    const [sheetModalOpen, setSheetModalOpen] = useState(false);
    const [isMaster, setIsMaster] = useState(false);
    const [isAdminPlayer, setIsAdminPlayer] = useState(false);
    const [isPlayer, setIsPlayer] = useState(false);
    const [xpSystem, setXpSystem] = useState(true);
    const [gridVisible, setGridVisible] = useState(true);
    const [diceTrayOpen, setDiceTrayOpen] = useState(false);
    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [imageHighlightManagerModalOpen, setImageHighlightManagerModalOpen] =
        useState(false);
    const [imageHighlightViewerOpen, setImageHighlightViewerOpen] = useState(false);
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
    const [matchImages, setMatchImages] = useState<ImageObject[]>([]);
    const [highlightedMatchImage, setHighlightedMatchImage] =
        useState<ImageObject | null>(null);
    const [imageHighlightUploading, setImageHighlightUploading] = useState(false);
    const [selectingHighlightedImageId, setSelectingHighlightedImageId] = useState<
        string | null
    >(null);
    const [mapImages, setMapImages] = useState<ImageObject[]>([]);
    const [playingMusicId, setPlayingMusicId] = useState<string | null>(null);
    const [musicVolume, setMusicVolume] = useState(50);
    const [musicVolumeOpen, setMusicVolumeOpen] = useState(false);
    const [charPanelOpen, setCharPanelOpen] = useState(false);
    const [charPanelTab, setCharPanelTab] = useState<'resumo' | 'magias' | 'habilidades'>(
        'resumo'
    );
    const [campaignCharacters, setCampaignCharacters] = useState<CampaignCharacter[]>([]);
    const [campaignCharacterSummaries, setCampaignCharacterSummaries] = useState<
        Record<string, MapTokenSummary>
    >({});
    const [characterAuthorRanksByUserId, setCharacterAuthorRanksByUserId] = useState<
        Record<string, string>
    >({});
    const [mapTokenLayoutById, setMapTokenLayoutById] = useState<
        Record<string, MapTokenLayout>
    >({});
    const [clonedMapTokens, setClonedMapTokens] = useState<MapTokenInstance[]>([]);
    const [cloneTokenHitPoints, setCloneTokenHitPoints] = useState<
        Record<string, number | null>
    >({});
    const [visibleMapCharacterIds, setVisibleMapCharacterIds] = useState<string[]>([]);
    const [avatarSearch, setAvatarSearch] = useState('');
    const [journalPosts, setJournalPosts] = useState<JournalPost[]>([]);
    const [highlightedJournalPost, setHighlightedJournalPost] =
        useState<JournalPost | null>(null);
    const [myCharacters, setMyCharacters] = useState<CampaignCharacter[]>([]);
    const [selectedMapCharacterId, setSelectedMapCharacterId] = useState<string | null>(
        null
    );
    const [characterDetailRefreshVersion, setCharacterDetailRefreshVersion] = useState(0);
    const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
    const [selectedCharacter, setSelectedCharacter] = useState<FullCharacterDnd | null>(
        null
    );
    const [characterLoading, setCharacterLoading] = useState(false);
    const [className, setClassName] = useState('');
    const [spellNameMap, setSpellNameMap] = useState<Record<string, string>>({});
    const [spellUsed, setSpellUsed] = useState<Record<string, boolean>>({});
    const [spellSlotsUsed, setSpellSlotsUsed] = useState<Record<number, number>>({});
    const [panelDetailSpell, setPanelDetailSpell] = useState<{
        name: string;
        description: string;
        type: string;
        castingTime: string;
        duration: string;
        range: string;
        components: string;
        higherLevels: string;
    } | null>(null);
    const [panelDetailLoading, setPanelDetailLoading] = useState(false);
    const [panelDetailKey, setPanelDetailKey] = useState<string | null>(null);
    const [abilityUsed, setAbilityUsed] = useState<Record<string, boolean>>({});
    const [abilitySlotsUsed, setAbilitySlotsUsed] = useState<Record<number, number>>({});
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
    const [cloneLifeEditor, setCloneLifeEditor] = useState<CloneLifeEditorState | null>(
        null
    );
    const [cloneLifeInput, setCloneLifeInput] = useState('');
    useBodyScrollLock(
        panelDetailSpell !== null ||
            panelDetailLoading ||
            cloneLifeEditor !== null ||
            journalHighlightModalOpen ||
            journalHighlightNoticeOpen
    );
    const seenHighlightedMatchImageIdRef = useRef<string | null>(null);

    useEffect(() => {
        function syncViewportOrientation() {
            setRequiresLandscapeViewport(requiresLandscapeViewportOnDevice());
            setIsLandscapeViewport(window.innerWidth >= window.innerHeight);
        }

        syncViewportOrientation();
        window.addEventListener('resize', syncViewportOrientation);
        window.addEventListener('orientationchange', syncViewportOrientation);

        return () => {
            window.removeEventListener('resize', syncViewportOrientation);
            window.removeEventListener('orientationchange', syncViewportOrientation);
        };
    }, []);

    const isDarkTheme = themeMode === 'dark';
    const LogoSVG = isDarkTheme ? LogoDarkSVG : LogoLightSVG;
    const SheetSVG = isDarkTheme ? SheetDarkSVG : SheetLightSVG;
    const MediaSVG = isDarkTheme ? MediaDarkSVG : MediaLightSVG;
    const LeftPanelOpenSVG = isDarkTheme ? LeftPanelOpenDarkSVG : LeftPanelOpenLightSVG;
    const EditBlueSVG = isDarkTheme ? EditDarkSVG : EditLightSVG;
    const StarBlueSVG = isDarkTheme ? StarDarkSVG : StarLightSVG;
    const AvatarSelectionSVG = isDarkTheme
        ? AvatarSelectionDarkSVG
        : AvatarSelectionLightSVG;
    const ResizeBlueSVG = isDarkTheme ? ResizeDarkSVG : ResizeLightSVG;
    const CloneSVG = isDarkTheme ? CloneDarkSVG : CloneLightSVG;
    const BookmarkSVG = isDarkTheme ? BookmarkDarkSVG : BookmarkLightSVG;
    const ImageHighlightSVG = isDarkTheme
        ? ImageHighlightDarkSVG
        : ImageHighlightLightSVG;
    const VolumeSVG = isDarkTheme ? VolumeDarkSVG : VolumeLightSVG;
    const DiceSVG = isDarkTheme ? DiceDarkSVG : DiceLightSVG;
    const D4SVG = isDarkTheme ? D4DarkSVG : D4LightSVG;
    const D6SVG = isDarkTheme ? D6DarkSVG : D6LightSVG;
    const D8SVG = isDarkTheme ? D8DarkSVG : D8LightSVG;
    const D10SVG = isDarkTheme ? D10DarkSVG : D10LightSVG;
    const D12SVG = isDarkTheme ? D12DarkSVG : D12LightSVG;
    const D20SVG = isDarkTheme ? D20DarkSVG : D20LightSVG;
    const GridOffSVG = isDarkTheme ? GridOffDarkSVG : GridOffLightSVG;
    const GridOnSVG = isDarkTheme ? GridOnDarkSVG : GridOnLightSVG;

    const diceOptions = [
        { label: 'D20', icon: D20SVG, sides: 20 },
        { label: 'D12', icon: D12SVG, sides: 12 },
        { label: 'D10', icon: D10SVG, sides: 10 },
        { label: 'D8', icon: D8SVG, sides: 8 },
        { label: 'D6', icon: D6SVG, sides: 6 },
        { label: 'D4', icon: D4SVG, sides: 4 },
    ];

    const getImageIdentity = (image: ImageObject | null | undefined): string | null =>
        image?.id || image?.link || null;

    const applyHighlightedMatchImage = (
        image: ImageObject | null,
        options?: { openIfNew?: boolean }
    ) => {
        setHighlightedMatchImage(image);

        const imageIdentity = getImageIdentity(image);
        if (!imageIdentity) {
            seenHighlightedMatchImageIdRef.current = null;
            setImageHighlightViewerOpen(false);
            return;
        }

        if (
            options?.openIfNew &&
            seenHighlightedMatchImageIdRef.current !== imageIdentity
        ) {
            seenHighlightedMatchImageIdRef.current = imageIdentity;
            setImageHighlightViewerOpen(true);
        }
    };

    const getMatchDataHighlightedImage = (
        matchData: MatchDataWithImageHighlight | undefined
    ): ImageObject | null =>
        matchData?.imageHighlighted ?? matchData?.imageHighlight ?? null;

    const getCloneDisplayedHitPoints = (tokenId: string, characterId: string) => {
        if (Object.prototype.hasOwnProperty.call(cloneTokenHitPoints, tokenId)) {
            return cloneTokenHitPoints[tokenId];
        }

        return campaignCharacterSummaries[characterId]?.currentHitPoints ?? null;
    };

    const previousCampaignCharacterIdsRef = useRef<string[]>([]);
    const hasInitializedVisibleMapCharactersRef = useRef(false);
    const loadedSpellKeyRef = useRef<string | null>(null);
    const [dicePickerState, setDicePickerState] = useState<{
        sides: number;
        label: string;
        icon: string;
        count: number;
    } | null>(null);
    const [diceRollSession, setDiceRollSession] = useState<DiceRollSession>(
        createIdleDiceRollSession
    );
    const reportSocketIssue = (_message: string) => undefined;

    const dismissDiceRoll = () => {
        diceRollSessionIdRef.current += 1;
        diceBoxRef.current?.clearDice();
        setDiceRollSession(createIdleDiceRollSession());
    };

    const openSpellDetail = async (level: number, spellId: string) => {
        setPanelDetailKey(`${level}-${spellId}`);
        setPanelDetailLoading(true);
        setPanelDetailSpell(null);
        const result = await getDnd5eSpellById(spellId);
        setPanelDetailSpell(result as any);
        setPanelDetailLoading(false);
    };

    const closeSpellDetail = () => {
        setPanelDetailSpell(null);
        setPanelDetailLoading(false);
        setPanelDetailKey(null);
    };

    const handleUseSpell = () => {
        if (!panelDetailKey) return;
        const [levelStr] = panelDetailKey.split('-');
        const level = Number(levelStr);
        setSpellUsed((prev) => ({ ...prev, [panelDetailKey]: true }));
        setSpellSlotsUsed((prev) => ({ ...prev, [level]: (prev[level] ?? 0) + 1 }));
        closeSpellDetail();
    };

    const handleSpellClick = (level: number, spellId: string, maxSlots: number) => {
        const key = `${level}-${spellId}`;
        if (spellUsed[key]) {
            setSpellUsed((prev) => ({ ...prev, [key]: false }));
            setSpellSlotsUsed((prev) => ({
                ...prev,
                [level]: Math.max(0, (prev[level] ?? 0) - 1),
            }));
            return;
        }
        if (maxSlots > 0 && (spellSlotsUsed[level] ?? 0) >= maxSlots) return;
        openSpellDetail(level, spellId);
    };

    const resetSpellMarks = () => {
        setSpellUsed({});
        setSpellSlotsUsed({});
    };

    const handleAbilityClick = (level: number, abilityName: string, maxSlots: number) => {
        const key = `${level}-${abilityName}`;
        if (abilityUsed[key]) {
            setAbilityUsed((prev) => ({ ...prev, [key]: false }));
            setAbilitySlotsUsed((prev) => ({
                ...prev,
                [level]: Math.max(0, (prev[level] ?? 0) - 1),
            }));
            return;
        }
        if (maxSlots > 0 && (abilitySlotsUsed[level] ?? 0) >= maxSlots) return;
        setAbilityUsed((prev) => ({ ...prev, [key]: true }));
        setAbilitySlotsUsed((prev) => ({ ...prev, [level]: (prev[level] ?? 0) + 1 }));
    };

    const resetAbilityMarks = () => {
        setAbilityUsed({});
        setAbilitySlotsUsed({});
    };

    const handleDiceLayerClick = () => {
        if (diceRollSession.status !== 'settled') return;
        dismissDiceRoll();
    };

    const applyMusicVolume = (volume: number) => {
        const playerWindow = musicPlayerFrameRef.current?.contentWindow;

        if (!playerWindow) {
            return;
        }

        const muteCommand =
            volume <= 0
                ? { event: 'command', func: 'mute', args: [] }
                : { event: 'command', func: 'unMute', args: [] };

        playerWindow.postMessage(JSON.stringify(muteCommand), '*');
        playerWindow.postMessage(
            JSON.stringify({
                event: 'command',
                func: 'setVolume',
                args: [volume],
            }),
            '*'
        );
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

        const requests: Promise<any>[] = [
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
                const removedPostTitle = post.title;
                setHighlightedJournalPost(null);
                setJournalHighlightReaderOpen(false);
                await setCampaignHighlightedJournalPost(campaignId, {
                    toggle: 'off',
                });
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
            const currentHighlightedPost = await loadHighlightedJournalPost({
                suppressErrorState: false,
            });

            if (currentHighlightedPost) {
                setJournalHighlightReaderOpen(true);
                return;
            }

            setJournalHighlightReaderOpen(false);
            setJournalHighlightNoticeMessage(
                'Nenhuma publicação em destaque no momento.'
            );
            setJournalHighlightNoticeOpen(true);
        } catch (error: any) {
            setJournalHighlightReaderOpen(false);
            setJournalHighlightNoticeMessage(
                error?.message ?? 'Erro ao carregar publicação em destaque.'
            );
            setJournalHighlightNoticeOpen(true);
        }
    };

    useEffect(() => {
        if (!playingMusicId) {
            setMusicVolumeOpen(false);
            return;
        }

        const timeoutId = window.setTimeout(() => {
            applyMusicVolume(musicVolume);
        }, 700);

        return () => window.clearTimeout(timeoutId);
    }, [playingMusicId, musicVolume]);

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
        const socket = campaignSocketRef.current;
        if (!socket) return;

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
            const ack = await emitCampaignSocketAck(socket, 'dice:roll_requested', {
                campaignId,
                characterId: selectedCharacterId || null,
                notation,
                label: rollLabel,
                visibility: 'room',
            });

            if (!ack.ok && diceRollSessionIdRef.current === sessionId) {
                dismissDiceRoll();
            }
        } catch (error) {
            if (diceRollSessionIdRef.current === sessionId) {
                dismissDiceRoll();
            }
        }
    };

    const handleLeaveMatch = (target: string) => {
        router.push(target);
    };

    const getMapLinkById = (mapId: string | null): string => {
        if (!mapId) return SideImageBackground.src;

        return mapImages.find((map) => map.id === mapId)?.link ?? SideImageBackground.src;
    };

    const canMoveCharacterToken = (character: CampaignCharacter): boolean => {
        if (!userInfo?.userId) return false;

        return isMaster || isAdminPlayer || character.authorUserId === userInfo.userId;
    };

    const getTokenIdentity = (
        tokenId: string
    ): { characterId: string; isClone: boolean } | null => {
        const baseCharacterId = getCharacterIdFromBaseTokenId(tokenId);

        if (baseCharacterId) {
            return {
                characterId: baseCharacterId,
                isClone: false,
            };
        }

        const cloneToken = clonedMapTokens.find((token) => token.tokenId === tokenId);

        if (!cloneToken) {
            return null;
        }

        return {
            characterId: cloneToken.characterId,
            isClone: true,
        };
    };

    const normalizeIncomingToken = (
        payload: MatchToken | TokenWrappedPayload
    ): MatchToken | null => {
        if ('token' in payload) {
            return payload.token;
        }

        return payload;
    };

    const normalizeIncomingTokenBatch = (
        payload: TokenBatchUpdatedPayload | TokenBatchWrappedPayload
    ): { campaignId: string; tokens: MatchToken[] } => {
        if ('tokens' in payload) {
            return {
                campaignId: payload.campaignId,
                tokens: payload.tokens,
            };
        }

        return {
            campaignId: payload.campaignId,
            tokens: payload.updates,
        };
    };

    const clearTokenBatchSyncTimeout = () => {
        if (tokenBatchSyncTimeoutRef.current === null) return;

        window.clearTimeout(tokenBatchSyncTimeoutRef.current);
        tokenBatchSyncTimeoutRef.current = null;
    };

    const flushPendingTokenSocketUpdates = async (): Promise<boolean> => {
        const socket = campaignSocketRef.current;
        const updates = Object.values(pendingTokenSocketUpdatesRef.current);

        clearTokenBatchSyncTimeout();

        if (!socket || !campaignId || updates.length === 0) {
            pendingTokenSocketUpdatesRef.current = {};
            return true;
        }

        pendingTokenSocketUpdatesRef.current = {};

        const normalizedUpdates = updates
            .map((update) => {
                const tokenIdentity = getTokenIdentity(update.tokenId);

                if (!tokenIdentity) {
                    return null;
                }

                return {
                    ...update,
                    characterId: tokenIdentity.characterId,
                    isClone: tokenIdentity.isClone,
                };
            })
            .filter(Boolean) as Array<{
            tokenId: string;
            characterId?: string;
            isClone?: boolean;
            xPct: number;
            yPct: number;
            widthPct: number;
        }>;

        if (normalizedUpdates.length === 0) {
            return true;
        }

        const ack = await emitCampaignSocketAck(socket, 'token:batch_update', {
            campaignId,
            updates: normalizedUpdates,
        });

        if (!ack.ok) {
            reportSocketIssue(ack.error.message);
            return false;
        }

        return true;
    };

    const scheduleTokenSocketUpdate = (update: {
        tokenId: string;
        xPct: number;
        yPct: number;
        widthPct: number;
    }) => {
        pendingTokenSocketUpdatesRef.current[update.tokenId] = update;

        if (tokenBatchSyncTimeoutRef.current !== null) {
            return;
        }

        tokenBatchSyncTimeoutRef.current = window.setTimeout(() => {
            flushPendingTokenSocketUpdates().catch((error) => {
                reportSocketIssue(String(error));
            });
        }, 120);
    };

    const shouldIgnoreIncomingTokenUpdate = (token: MatchToken): boolean => {
        return (
            activeTokenInteractionRef.current?.tokenId === token.tokenId &&
            token.updatedBy === userInfo?.userId
        );
    };

    const applyIncomingToken = (token: MatchToken) => {
        if (shouldIgnoreIncomingTokenUpdate(token)) return;

        setMapTokenLayoutById((current) => ({
            ...current,
            [token.tokenId]: {
                xPct: token.xPct,
                yPct: token.yPct,
                widthPct: token.widthPct,
            },
        }));

        if (token.isClone) {
            setClonedMapTokens((current) =>
                current.some((entry) => entry.tokenId === token.tokenId)
                    ? current.map((entry) =>
                          entry.tokenId === token.tokenId
                              ? {
                                    ...entry,
                                    characterId: token.characterId,
                                }
                              : entry
                      )
                    : [
                          ...current,
                          {
                              tokenId: token.tokenId,
                              characterId: token.characterId,
                              isClone: true,
                          },
                      ]
            );
        }
    };

    const applyIncomingTokenBatch = (tokens: MatchToken[]) => {
        const filteredTokens = tokens.filter(
            (token) => !shouldIgnoreIncomingTokenUpdate(token)
        );

        if (filteredTokens.length === 0) return;

        setMapTokenLayoutById((current) => {
            const nextLayouts = { ...current };

            filteredTokens.forEach((token) => {
                nextLayouts[token.tokenId] = {
                    xPct: token.xPct,
                    yPct: token.yPct,
                    widthPct: token.widthPct,
                };
            });

            return nextLayouts;
        });

        setClonedMapTokens((current) => {
            const cloneMap = new Map(current.map((token) => [token.tokenId, token]));

            filteredTokens
                .filter((token) => token.isClone)
                .forEach((token) => {
                    cloneMap.set(token.tokenId, {
                        tokenId: token.tokenId,
                        characterId: token.characterId,
                        isClone: true,
                    });
                });

            return Array.from(cloneMap.values());
        });
    };

    const applySocketTokenSnapshot = (tokens: MatchToken[]) => {
        setClonedMapTokens(
            tokens
                .filter((token) => token.isClone)
                .map((token) => ({
                    tokenId: token.tokenId,
                    characterId: token.characterId,
                    isClone: true,
                }))
        );
        setMapTokenLayoutById(
            Object.fromEntries(
                tokens.map((token) => [
                    token.tokenId,
                    {
                        xPct: token.xPct,
                        yPct: token.yPct,
                        widthPct: token.widthPct,
                    },
                ])
            )
        );
    };

    const playResolvedDiceRoll = async (payload: DiceRollResolvedPayload) => {
        const sessionId = diceRollSessionIdRef.current + 1;
        diceRollSessionIdRef.current = sessionId;
        const forcedNotation =
            payload.rolls.length > 0
                ? `${payload.notation}@${payload.rolls.join(',')}`
                : payload.notation;

        setDicePickerState(null);
        setDiceRollSession({
            status: 'rolling',
            label: payload.label,
            count: payload.rolls.length || 1,
            notation: payload.notation,
            rolls: null,
            total: null,
        });

        try {
            const diceBox = await ensureDiceBox();
            await diceBox.roll(forcedNotation);

            if (diceRollSessionIdRef.current !== sessionId) return;

            setDiceRollSession({
                status: 'settled',
                label: payload.label,
                count: payload.rolls.length || 1,
                notation: payload.notation,
                rolls: payload.rolls,
                total: payload.total,
            });
        } catch (error) {
            if (diceRollSessionIdRef.current === sessionId) {
                setDiceRollSession({
                    status: 'settled',
                    label: payload.label,
                    count: payload.rolls.length || 1,
                    notation: payload.notation,
                    rolls: payload.rolls,
                    total: payload.total,
                });
            }
        }
    };

    useEffect(() => {
        return () => {
            diceRollSessionIdRef.current += 1;
            clearTokenBatchSyncTimeout();
            diceBoxRef.current?.clearDice();
            diceBoxHostRef.current?.replaceChildren();
        };
    }, []);

    useEffect(() => {
        const warningMessage =
            'Atualizar esta pagina pode levar a comportamentos inesperados, por favor, se possível saia da partida e entre novamente.';

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = warningMessage;
            return warningMessage;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        if (!campaignId || !userInfo?.userId) return;

        hasHydratedMatchSyncRef.current = false;
        hasAppliedVisibleCharacterSyncRef.current = false;

        const socket = getCampaignSocket();
        campaignSocketRef.current = socket;

        const handleCampaignSync = (payload: CampaignSyncPayload) => {
            if (payload.campaignId !== campaignId) return;

            hasHydratedMatchSyncRef.current = true;
            setBackgroundImage((current) => {
                if (payload.match.activeMap) {
                    return payload.match.activeMap;
                }

                return current || mapImages[0]?.link || SideImageBackground.src;
            });
            setGridVisible(payload.match.gridVisible);
            setActiveEffect(payload.match.activeEffect);
            setPlayingMusicId(payload.match.playingMusicId);
            setMatchImages(payload.match.images ?? []);

            if (payload.match.visibleCharacterIds.length > 0) {
                hasAppliedVisibleCharacterSyncRef.current = true;
                setVisibleMapCharacterIds(payload.match.visibleCharacterIds);
            }

            setHighlightedJournalPost(
                normalizeHighlightedJournalPostPayload(payload.match)
            );
            applyHighlightedMatchImage(payload.match.imageHighlighted ?? null, {
                openIfNew: true,
            });
            applySocketTokenSnapshot(payload.match.tokens);
        };

        const handleMapChanged = (payload: {
            campaignId: string;
            activeMap: string | null;
        }) => {
            if (payload.campaignId !== campaignId) return;
            setBackgroundImage((current) => {
                if (payload.activeMap) {
                    return payload.activeMap;
                }

                return current || mapImages[0]?.link || SideImageBackground.src;
            });
        };

        const handleGridChanged = (payload: {
            campaignId: string;
            gridVisible: boolean;
        }) => {
            if (payload.campaignId !== campaignId) return;
            setGridVisible(payload.gridVisible);
        };

        const handleEffectChanged = (payload: {
            campaignId: string;
            activeEffect: MapEffect | null;
        }) => {
            if (payload.campaignId !== campaignId) return;
            setActiveEffect(payload.activeEffect);
        };

        const handleMusicChanged = (payload: {
            campaignId: string;
            playingMusicId: string | null;
        }) => {
            if (payload.campaignId !== campaignId) return;
            setPlayingMusicId(payload.playingMusicId);
        };

        const handleVisibleCharactersChanged = (payload: {
            campaignId: string;
            visibleCharacterIds: string[];
        }) => {
            if (payload.campaignId !== campaignId) return;

            hasHydratedMatchSyncRef.current = true;
            hasAppliedVisibleCharacterSyncRef.current = true;
            setVisibleMapCharacterIds(payload.visibleCharacterIds);
        };

        const handleTokenCloneCreated = (payload: MatchToken | TokenWrappedPayload) => {
            const token = normalizeIncomingToken(payload);

            if (
                !token ||
                ('campaignId' in payload && payload.campaignId !== campaignId)
            ) {
                return;
            }

            applyIncomingToken(token);
        };

        const handleTokenUpdated = (payload: MatchToken | TokenWrappedPayload) => {
            const token = normalizeIncomingToken(payload);

            if (
                !token ||
                ('campaignId' in payload && payload.campaignId !== campaignId)
            ) {
                return;
            }

            applyIncomingToken(token);
        };

        const handleTokenBatchUpdated = (
            payload: TokenBatchUpdatedPayload | TokenBatchWrappedPayload
        ) => {
            const normalizedPayload = normalizeIncomingTokenBatch(payload);

            if (normalizedPayload.campaignId !== campaignId) return;
            applyIncomingTokenBatch(normalizedPayload.tokens);
        };

        const handleTokenDeleted = (payload: TokenDeletedPayload) => {
            if (payload.campaignId !== campaignId) return;

            setClonedMapTokens((current) =>
                current.filter((token) => token.tokenId !== payload.tokenId)
            );
            setMapTokenLayoutById((current) => {
                const nextLayouts = { ...current };
                delete nextLayouts[payload.tokenId];
                return nextLayouts;
            });
        };

        const handleDiceRollResolved = (payload: DiceRollResolvedPayload) => {
            if (payload.campaignId !== campaignId) return;

            playResolvedDiceRoll(payload).catch((error) => {
                reportSocketIssue(String(error));
            });
        };

        const handleJournalHighlightChanged = (payload: {
            campaignId: string;
            highlightedJournalPost?: SocketJournal | null;
        }) => {
            if (payload.campaignId !== campaignId) return;
            const nextHighlightedPost = normalizeHighlightedJournalPostPayload(payload);

            setHighlightedJournalPost(nextHighlightedPost);

            if (!nextHighlightedPost) {
                setJournalHighlightReaderOpen(false);
            }
        };

        const handleJournalPostCreated = (payload: {
            campaignId: string;
            post: SocketJournal;
        }) => {
            if (payload.campaignId !== campaignId) return;

            setJournalPosts((current) =>
                current.some((post) =>
                    post.postId
                        ? post.postId === payload.post.postId
                        : post.title === payload.post.title &&
                          post.timestamp === payload.post.timestamp
                )
                    ? current
                    : [payload.post, ...current]
            );
        };

        const handleCharacterUpdated = (payload: CharacterUpdatedPayload) => {
            if (payload.campaignId !== campaignId) return;

            setCampaignCharacterSummaries((current) => ({
                ...current,
                [payload.characterId]: {
                    currentHitPoints: payload.summary.currentHitPoints,
                    level: payload.summary.level,
                },
            }));

            if (selectedCharacterIdRef.current === payload.characterId) {
                setCharacterLoading(true);
                getCharacterById(payload.characterId)
                    .then((data) => setSelectedCharacter(data))
                    .finally(() => setCharacterLoading(false));
            }

            if (selectedMapCharacterIdRef.current === payload.characterId) {
                setCharacterDetailRefreshVersion((current) => current + 1);
            }

            if (
                payload.updatedFields.some(
                    (field) => field.startsWith('profile') || field.startsWith('picture')
                )
            ) {
                getCharactersByCampaignLobby(campaignId).then((data) => {
                    setCampaignCharacters(data);
                });
            }
        };

        const handleMapsUpdated = (payload: CampaignMapsUpdatedPayload) => {
            if (payload.campaignId !== campaignId) return;
            setMapImages(payload.mapImages);
        };

        const handleMusicsUpdated = (payload: CampaignMusicsUpdatedPayload) => {
            if (payload.campaignId !== campaignId) return;
            setMusics(payload.musics);
        };

        const handleImagesUpdated = (payload: CampaignImagesUpdatedPayload) => {
            if (payload.campaignId !== campaignId) return;
            setMatchImages(payload.images);
        };

        const handleImageHighlightedChanged = (
            payload: MatchImageHighlightedChangedPayload
        ) => {
            if (payload.campaignId !== campaignId) return;
            applyHighlightedMatchImage(payload.imageHighlighted ?? null, {
                openIfNew: true,
            });
        };

        const handleSocketError = (payload: { message: string }) => {
            reportSocketIssue(payload.message);
        };

        socket.on('campaign:sync', handleCampaignSync);
        socket.on('match:map_changed', handleMapChanged as never);
        socket.on('match:grid_changed', handleGridChanged as never);
        socket.on('match:effect_changed', handleEffectChanged as never);
        socket.on('match:music_changed', handleMusicChanged as never);
        socket.on(
            'match:visible_characters_changed',
            handleVisibleCharactersChanged as never
        );
        socket.on('token:clone_created', handleTokenCloneCreated);
        socket.on('token:updated', handleTokenUpdated);
        socket.on('token:batch_updated', handleTokenBatchUpdated as never);
        socket.on('token:deleted', handleTokenDeleted as never);
        socket.on('dice:roll_resolved', handleDiceRollResolved);
        socket.on('journal:highlight_changed', handleJournalHighlightChanged as never);
        socket.on('journal:post_created', handleJournalPostCreated as never);
        socket.on('character:updated', handleCharacterUpdated as never);
        socket.on('campaign:maps_updated', handleMapsUpdated);
        socket.on('campaign:images_updated', handleImagesUpdated);
        socket.on('match:image_highlighted_changed', handleImageHighlightedChanged);
        socket.on('campaign:musics_updated', handleMusicsUpdated);
        socket.on('campaign:error', handleSocketError as never);

        emitCampaignSocketAck(socket, 'campaign:join', { campaignId }).then((ack) => {
            if (!ack.ok) {
                reportSocketIssue(ack.error.message);
                return;
            }
        });

        return () => {
            clearTokenBatchSyncTimeout();
            pendingTokenSocketUpdatesRef.current = {};
            socket.off('campaign:sync', handleCampaignSync);
            socket.off('match:map_changed', handleMapChanged as never);
            socket.off('match:grid_changed', handleGridChanged as never);
            socket.off('match:effect_changed', handleEffectChanged as never);
            socket.off('match:music_changed', handleMusicChanged as never);
            socket.off(
                'match:visible_characters_changed',
                handleVisibleCharactersChanged as never
            );
            socket.off('token:clone_created', handleTokenCloneCreated);
            socket.off('token:updated', handleTokenUpdated);
            socket.off('token:batch_updated', handleTokenBatchUpdated as never);
            socket.off('token:deleted', handleTokenDeleted as never);
            socket.off('dice:roll_resolved', handleDiceRollResolved);
            socket.off(
                'journal:highlight_changed',
                handleJournalHighlightChanged as never
            );
            socket.off('journal:post_created', handleJournalPostCreated as never);
            socket.off('character:updated', handleCharacterUpdated as never);
            socket.off('campaign:maps_updated', handleMapsUpdated);
            socket.off('campaign:images_updated', handleImagesUpdated);
            socket.off('match:image_highlighted_changed', handleImageHighlightedChanged);
            socket.off('campaign:musics_updated', handleMusicsUpdated);
            socket.off('campaign:error', handleSocketError as never);
            campaignSocketRef.current = null;
            disconnectCampaignSocket();
        };
    }, [campaignId, userInfo?.userId]);

    useEffect(() => {
        if (!campaignId) return;
        getCampaignById(campaignId).then((data) => {
            const matchData = data?.matchData as MatchDataWithImageHighlight | undefined;
            const firstMap = matchData?.mapImages?.[0]?.link;
            if (firstMap) {
                setBackgroundImage((current) =>
                    !hasHydratedMatchSyncRef.current ||
                    current === SideImageBackground.src
                        ? firstMap
                        : current
                );
            }
            setMusics(data?.musics ?? []);
            setMapImages(matchData?.mapImages ?? []);
            setMatchImages(matchData?.images ?? []);
            applyHighlightedMatchImage(getMatchDataHighlightedImage(matchData), {
                openIfNew: true,
            });
            setXpSystem((data as any)?.configurations?.xpSystem ?? true);
            if (data && userInfo?.userId) {
                const role = data.campaignPlayers?.find(
                    (p: { userId: string; role: string }) => p.userId === userInfo.userId
                )?.role;
                setIsMaster(role === 'dungeon_master');
                setIsAdminPlayer(role === 'admin_player');
                setIsPlayer(role === 'player' || role === 'admin_player');
            }
        });
    }, [campaignId, userInfo?.userId]);

    const handleUploadMatchImage = async (file: UploadImageValue) => {
        setImageHighlightUploading(true);

        try {
            const updatedImages = await uploadMatchHighlightImages(campaignId, file);
            setMatchImages(updatedImages);
        } finally {
            setImageHighlightUploading(false);
        }
    };

    const handleSelectMatchHighlightedImage = async (
        imageId: string,
        remove?: boolean
    ) => {
        setSelectingHighlightedImageId(imageId);

        try {
            const highlightedImage = await setMatchHighlightedImage(
                campaignId,
                imageId,
                remove
            );
            applyHighlightedMatchImage(highlightedImage, { openIfNew: true });
            setImageHighlightManagerModalOpen(false);
        } finally {
            setSelectingHighlightedImageId(null);
        }
    };

    useEffect(() => {
        if (!campaignId) return;
        getCharactersByCampaignLobby(campaignId).then((data) => {
            setCampaignCharacters(data);
        });
    }, [campaignId]);

    useEffect(() => {
        if (campaignCharacters.length === 0) {
            setCharacterAuthorRanksByUserId({});
            return;
        }

        const authorIds = Array.from(
            new Set(
                campaignCharacters
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
    }, [campaignCharacters]);

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
        if (campaignCharacters.length === 0) {
            return;
        }

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
        setCloneTokenHitPoints((current) => {
            const next: Record<string, number | null> = {};
            let didChange = Object.keys(current).length !== clonedMapTokens.length;

            clonedMapTokens.forEach((token) => {
                const defaultHitPoints =
                    campaignCharacterSummaries[token.characterId]?.currentHitPoints ??
                    null;
                const hasStoredValue = Object.prototype.hasOwnProperty.call(
                    current,
                    token.tokenId
                );
                const storedValue = current[token.tokenId];
                const nextValue =
                    !hasStoredValue || (storedValue === null && defaultHitPoints !== null)
                        ? defaultHitPoints
                        : storedValue;

                next[token.tokenId] = nextValue;

                if (!hasStoredValue || storedValue !== nextValue) {
                    didChange = true;
                }
            });

            return didChange ? next : current;
        });
    }, [clonedMapTokens, campaignCharacterSummaries]);

    useEffect(() => {
        if (
            cloneLifeEditor &&
            !clonedMapTokens.some((token) => token.tokenId === cloneLifeEditor.tokenId)
        ) {
            setCloneLifeEditor(null);
            setCloneLifeInput('');
        }
    }, [cloneLifeEditor, clonedMapTokens]);

    useEffect(() => {
        if (campaignCharacters.length === 0) {
            return;
        }

        const currentIds = campaignCharacters.map((character) => character.id);
        const previousIds = previousCampaignCharacterIdsRef.current;

        setVisibleMapCharacterIds((previousVisibleIds) => {
            if (!hasInitializedVisibleMapCharactersRef.current) {
                if (hasAppliedVisibleCharacterSyncRef.current) {
                    return currentIds.filter((id) => previousVisibleIds.includes(id));
                }
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
    }, [campaignId, userInfo?.userId]);

    useEffect(() => {
        if (!selectedCharacterId) {
            setSelectedCharacter(null);
            setClassName('');
            return;
        }

        setCharacterLoading(true);
        getCharacterById(selectedCharacterId)
            .then((data) => setSelectedCharacter(data))
            .finally(() => setCharacterLoading(false));
    }, [selectedCharacterId]);

    useEffect(() => {
        const classId = selectedCharacter?.data?.profile?.class;

        if (!classId) {
            setClassName('');
            return;
        }

        Promise.all([classId ? getDnd5eClassById(classId) : Promise.resolve(null)]).then(
            ([classData]) => {
                setClassName(classData?.name ?? '');
            }
        );
    }, [selectedCharacter?.data?.profile?.class]);

    const spellData = (selectedCharacter?.data?.spells as any) ?? null;
    const selectedCharacterSpellIds = getUniqueSpellIds(spellData);
    const selectedCharacterSpellIdsKey = selectedCharacterSpellIds.join('|');

    useEffect(() => {
        if (!charPanelOpen || charPanelTab !== 'magias') {
            return;
        }

        if (!selectedCharacterSpellIdsKey) {
            setSpellNameMap({});
            loadedSpellKeyRef.current = null;
            return;
        }

        if (loadedSpellKeyRef.current === selectedCharacterSpellIdsKey) {
            return;
        }

        Promise.all(selectedCharacterSpellIds.map((id) => getDnd5eSpellById(id))).then(
            (results) => {
                const map: Record<string, string> = {};
                results.forEach((result: any, i: number) => {
                    if (result?.name) {
                        map[selectedCharacterSpellIds[i]] = result.name;
                    }
                });
                setSpellNameMap(map);
                loadedSpellKeyRef.current = selectedCharacterSpellIdsKey;
            }
        );
    }, [charPanelOpen, charPanelTab, selectedCharacterSpellIdsKey]);

    useEffect(() => {
        selectedCharacterIdRef.current = selectedCharacterId;
    }, [selectedCharacterId]);

    useEffect(() => {
        selectedMapCharacterIdRef.current = selectedMapCharacterId;
    }, [selectedMapCharacterId]);

    useEffect(() => {
        mapTokenLayoutByIdRef.current = mapTokenLayoutById;
    }, [mapTokenLayoutById]);

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

    const spellsByLevel: Array<{
        label: string;
        items: string[];
        slots?: string;
        slotsTotal: number;
    }> = [
        { label: 'Truques', items: spellData?.cantrips ?? [], slotsTotal: 0 },
        ...Array.from({ length: 9 }, (_, i) => {
            const level = i + 1;
            const levelData = spellData?.[level];
            return {
                label: `${level}º Círculo`,
                items: levelData?.spellIds ?? [],
                slotsTotal:
                    typeof levelData?.slotsTotal === 'number' ? levelData.slotsTotal : 0,
                slots:
                    typeof levelData?.slotsTotal === 'number'
                        ? `${levelData.slotsExpended ?? 0}/${levelData.slotsTotal}`
                        : undefined,
            };
        }),
    ];

    const abilitiesData = (selectedCharacter?.data?.extraAbilities as any) ?? null;
    const abilitiesByLevel: Array<{
        label: string;
        items: string[];
        slots?: string;
        slotsTotal: number;
    }> = [
        { label: 'Truques', items: abilitiesData?.cantrips ?? [], slotsTotal: 0 },
        ...Array.from({ length: 9 }, (_, i) => {
            const level = i + 1;
            const levelData = abilitiesData?.[level];
            return {
                label: `${level}º Nível`,
                items: levelData?.extraAbilityNames ?? [],
                slotsTotal:
                    typeof levelData?.slotsTotal === 'number' ? levelData.slotsTotal : 0,
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

                    const nextLayout = {
                        ...currentLayout,
                        xPct: (clamp(nextXPx, 0, maxXPx) / containerRect.width) * 100,
                        yPct: (clamp(nextYPx, 0, maxYPx) / containerRect.height) * 100,
                    };
                    nextLayouts[interaction.tokenId] = nextLayout;
                    scheduleTokenSocketUpdate({
                        tokenId: interaction.tokenId,
                        xPct: nextLayout.xPct,
                        yPct: nextLayout.yPct,
                        widthPct: nextLayout.widthPct,
                    });

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

                const nextLayout = {
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
                nextLayouts[interaction.tokenId] = nextLayout;
                scheduleTokenSocketUpdate({
                    tokenId: interaction.tokenId,
                    xPct: nextLayout.xPct,
                    yPct: nextLayout.yPct,
                    widthPct: nextLayout.widthPct,
                });

                return nextLayouts;
            });
        };

        const handlePointerEnd = async () => {
            const interaction = activeTokenInteractionRef.current;
            if (interaction?.didMove) {
                suppressTokenClickIdRef.current = interaction.tokenId;
            }
            setActiveTokenInteractionMeta(null);

            if (!interaction?.didMove) {
                activeTokenInteractionRef.current = null;
                return;
            }

            const didFlush = await flushPendingTokenSocketUpdates();

            if (!didFlush) {
                setMapTokenLayoutById((current) => ({
                    ...current,
                    [interaction.tokenId]: {
                        xPct: interaction.startXPct,
                        yPct: interaction.startYPct,
                        widthPct: interaction.startWidthPct,
                    },
                }));
            }

            activeTokenInteractionRef.current = null;
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
        tokenId: string,
        canMoveToken: boolean
    ) => {
        if (event.button !== 0) return;
        if (type === 'drag' && !canMoveToken) return;
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

        if (token.isClone) {
            const currentHitPoints = getCloneDisplayedHitPoints(
                token.tokenId,
                token.characterId
            );
            setCloneLifeEditor({
                tokenId: token.tokenId,
                characterName: character.name,
            });
            setCloneLifeInput(currentHitPoints === null ? '' : String(currentHitPoints));
            return;
        }

        if (character.authorUserId !== userInfo?.userId) {
            setSelectedMapCharacterId(character.id);
        }
    };

    const handleCloneLifeSave = () => {
        if (!cloneLifeEditor) return;

        const normalizedInput = cloneLifeInput.trim();

        setCloneTokenHitPoints((current) => ({
            ...current,
            [cloneLifeEditor.tokenId]:
                normalizedInput === ''
                    ? null
                    : Math.max(0, Math.trunc(Number(normalizedInput) || 0)),
        }));
        setCloneLifeEditor(null);
        setCloneLifeInput('');
    };

    const handleCloneToken = (token: MapTokenInstance) => {
        const socket = campaignSocketRef.current;
        const sourceLayout = mapTokenLayoutByIdRef.current[token.tokenId];
        if (!socket || !sourceLayout) return;

        emitCampaignSocketAck(socket, 'token:create_clone', {
            campaignId,
            characterId: token.characterId,
            xPct: sourceLayout.xPct,
            yPct: sourceLayout.yPct,
            widthPct: sourceLayout.widthPct,
        }).then((ack) => {
            if (!ack.ok) {
                reportSocketIssue(ack.error.message);
            }
        });
    };

    const deleteCloneTokenById = async (tokenId: string) => {
        const socket = campaignSocketRef.current;
        if (!socket) return;

        const ack = await emitCampaignSocketAck(socket, 'token:delete', {
            campaignId,
            tokenId,
        });

        if (!ack.ok) {
            reportSocketIssue(ack.error.message);
            return;
        }

        setClonedMapTokens((current) =>
            current.filter((entry) => entry.tokenId !== tokenId)
        );
        setCloneTokenHitPoints((current) => {
            if (!Object.prototype.hasOwnProperty.call(current, tokenId)) {
                return current;
            }

            const next = { ...current };
            delete next[tokenId];
            return next;
        });
        setMapTokenLayoutById((current) => {
            if (!current[tokenId]) {
                return current;
            }

            const nextLayouts = { ...current };
            delete nextLayouts[tokenId];
            return nextLayouts;
        });
    };

    const handleDeleteCloneToken = (token: MapTokenInstance) => {
        if (!token.isClone) return;

        void deleteCloneTokenById(token.tokenId);
    };

    const handleRemoveAllClones = async () => {
        if (clonedMapTokens.length === 0) return;

        await Promise.all(
            clonedMapTokens.map((token) => deleteCloneTokenById(token.tokenId))
        );
    };

    const handleRemoveAllAvatars = async () => {
        if (visibleMapCharacterIds.length === 0 && clonedMapTokens.length === 0) return;

        const hasVisibleAvatars = visibleMapCharacterIds.length > 0;
        const didClearVisibleAvatars = hasVisibleAvatars
            ? await handleVisibleCharacterIdsChange([])
            : true;

        if (!didClearVisibleAvatars) {
            return;
        }

        await handleRemoveAllClones();
    };

    const handleGridToggle = async () => {
        const socket = campaignSocketRef.current;
        if (!socket) return;

        const previousValue = gridVisible;
        const nextValue = !previousValue;

        setGridVisible(nextValue);

        const ack = await emitCampaignSocketAck(socket, 'match:set_grid', {
            campaignId,
            gridVisible: nextValue,
        });

        if (!ack.ok) {
            setGridVisible(previousValue);
        }
    };

    const handleEffectToggle = async (effect: MapEffect) => {
        const socket = campaignSocketRef.current;
        if (!socket) return;

        const previousEffect = activeEffect;
        const nextEffect = previousEffect === effect ? null : effect;

        setActiveEffect(nextEffect);

        const ack = await emitCampaignSocketAck(socket, 'match:set_effect', {
            campaignId,
            activeEffect: nextEffect,
        });

        if (!ack.ok) {
            setActiveEffect(previousEffect);
        }
    };

    const handleMusicSelection = async (musicId: string) => {
        const socket = campaignSocketRef.current;
        if (!socket) return;

        const previousMusicId = playingMusicId;
        const nextMusicId = previousMusicId === musicId ? null : musicId;

        setPlayingMusicId(nextMusicId);

        const ack = await emitCampaignSocketAck(socket, 'match:set_music', {
            campaignId,
            playingMusicId: nextMusicId,
        });

        if (!ack.ok) {
            setPlayingMusicId(previousMusicId);
        }
    };

    const handleMapSelection = async (mapId: string | null) => {
        const socket = campaignSocketRef.current;
        if (!socket) return;

        const previousBackgroundImage = backgroundImage;
        setBackgroundImage(getMapLinkById(mapId));

        const ack = await emitCampaignSocketAck(socket, 'match:set_map', {
            campaignId,
            mapId,
        });

        if (!ack.ok) {
            setBackgroundImage(previousBackgroundImage);
        }
    };

    const handleVisibleCharacterIdsChange = async (nextIds: string[]) => {
        const socket = campaignSocketRef.current;
        if (!socket) return false;

        const previousIds = visibleMapCharacterIds;
        setVisibleMapCharacterIds(nextIds);

        const ack = await emitCampaignSocketAck(socket, 'match:set_visible_characters', {
            campaignId,
            visibleCharacterIds: nextIds,
        });

        if (!ack.ok) {
            setVisibleMapCharacterIds(previousIds);
            return false;
        }

        return true;
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
            {requiresLandscapeViewport && !isLandscapeViewport && (
                <div className="match-orientation-overlay">
                    <div className="match-orientation-overlay-content">
                        <Image
                            src={WhiteRotateSVG.src}
                            alt=""
                            width={WhiteRotateSVG.width}
                            height={WhiteRotateSVG.height}
                            aria-hidden="true"
                        />
                        <p className="font-M-semibold match-orientation-overlay-text">
                            Por favor rotacione a tela para acessar o mapa
                        </p>
                    </div>
                </div>
            )}
            {/* Grid overlay */}
            {gridVisible && <div className="match-grid" />}
            {(activeEffect === 'dark' || activeEffect === 'light') && (
                <MapFogOverlay variant={activeEffect as FogVariant} />
            )}
            {activeEffect === 'rain' && <MapRainOverlay />}

            {/* Top-left: Tablerise logo */}
            <div
                className="match-logo-badge cursor-pointer"
                onClick={() => handleLeaveMatch('/')}
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
                        const displayedHitPoints = token.isClone
                            ? getCloneDisplayedHitPoints(token.tokenId, token.characterId)
                            : summary?.currentHitPoints ?? null;
                        const canMoveToken = canMoveCharacterToken(character);
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
                                }${!canMoveToken ? ' match-map-token--locked' : ''}${
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
                                    startTokenInteraction(
                                        'drag',
                                        event,
                                        token.tokenId,
                                        canMoveToken
                                    )
                                }
                                onClick={() => handleTokenClick(token, character)}
                            >
                                <div className="match-map-token-shell">
                                    {isMaster && cloneModeOpen && (
                                        <button
                                            type="button"
                                            className={`match-map-token-clone-handle${
                                                token.isClone
                                                    ? ' match-map-token-clone-handle--delete'
                                                    : ''
                                            }`}
                                            aria-label={
                                                token.isClone
                                                    ? `Remover clone de ${character.name}`
                                                    : `Duplicar ${character.name}`
                                            }
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                if (token.isClone) {
                                                    handleDeleteCloneToken(token);
                                                    return;
                                                }

                                                handleCloneToken(token);
                                            }}
                                            onPointerDown={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                            }}
                                        >
                                            <span className="match-map-token-clone-icon">
                                                {token.isClone ? '×' : '+'}
                                            </span>
                                        </button>
                                    )}
                                    <div className="match-map-token-frame">
                                        <RankedAvatarFrame
                                            image={
                                                character.image || SideImageBackground.src
                                            }
                                            alt={character.name}
                                            rank={
                                                characterAuthorRanksByUserId[
                                                    character.authorUserId
                                                ]
                                            }
                                            variant="avatar"
                                            className="match-map-token-ranked-avatar"
                                            sizes="(max-width: 768px) 6rem, 7rem"
                                        />
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
                                                    token.tokenId,
                                                    canMoveToken
                                                )
                                            }
                                        >
                                            <span className="match-map-token-resize-icon">
                                                ↘
                                            </span>
                                        </button>
                                    )}
                                </div>
                                <span
                                    className={`font-XXS-regular match-map-token-name${
                                        token.isClone
                                            ? ' match-map-token-name--clone'
                                            : ''
                                    }`}
                                >
                                    {character.name}
                                </span>
                                <div className="match-map-token-meta">
                                    <span className="font-XXS-regular match-map-token-stat">
                                        &#9829; {displayedHitPoints ?? '-'}
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
                            <LoadingDots label="Carregando personagem" />
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
                                                {profile.race}
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
                                            Dinheiro:{' '}
                                            {(['cp', 'sp', 'ep', 'gp', 'pp'] as const)
                                                .filter((key) => (money?.[key] ?? 0) > 0)
                                                .map((key) => (
                                                    <b key={key}>
                                                        {money![key]}{' '}
                                                        {CURRENCY_LABELS[key]}{' '}
                                                    </b>
                                                ))}
                                            {(
                                                ['cp', 'sp', 'ep', 'gp', 'pp'] as const
                                            ).every(
                                                (key) => (money?.[key] ?? 0) === 0
                                            ) && <b>0 PO</b>}
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
                                    {Object.values(spellUsed).some(Boolean) && (
                                        <button
                                            className="match-spell-reset-btn font-XXS-bold"
                                            onClick={resetSpellMarks}
                                        >
                                            Resetar marcações de magias
                                        </button>
                                    )}
                                    {spellsByLevel.map((level, levelIdx) => (
                                        <div
                                            key={level.label}
                                            className="match-char-section"
                                        >
                                            <p className="font-XXS-bold">
                                                {level.label}
                                                {level.slotsTotal > 0
                                                    ? ` • Slots ${
                                                          spellSlotsUsed[levelIdx] ?? 0
                                                      }/${level.slotsTotal}`
                                                    : ''}
                                            </p>
                                            {level.items.length > 0 ? (
                                                <div className="match-spell-list">
                                                    {level.items.map((spellId) => {
                                                        const key = `${levelIdx}-${spellId}`;
                                                        const used = spellUsed[key];
                                                        const blocked =
                                                            !used &&
                                                            level.slotsTotal > 0 &&
                                                            (spellSlotsUsed[levelIdx] ??
                                                                0) >= level.slotsTotal;
                                                        return (
                                                            <span
                                                                key={spellId}
                                                                className={`match-spell-item font-XXS-regular${
                                                                    used
                                                                        ? ' match-spell-item--used'
                                                                        : ''
                                                                }${
                                                                    blocked
                                                                        ? ' match-spell-item--blocked'
                                                                        : ''
                                                                }`}
                                                                onClick={() =>
                                                                    handleSpellClick(
                                                                        levelIdx,
                                                                        spellId,
                                                                        level.slotsTotal
                                                                    )
                                                                }
                                                            >
                                                                {spellNameMap[spellId] ||
                                                                    spellId}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="font-XXS-regular">
                                                    Sem magias
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {charPanelTab === 'habilidades' && (
                                <div className="match-char-content">
                                    {Object.values(abilityUsed).some(Boolean) && (
                                        <button
                                            className="match-spell-reset-btn"
                                            onClick={resetAbilityMarks}
                                        >
                                            Resetar marcações de habilidades
                                        </button>
                                    )}
                                    {abilitiesByLevel.map((level, levelIdx) => (
                                        <div
                                            key={level.label}
                                            className="match-char-section"
                                        >
                                            <p className="font-XXS-bold">
                                                {level.label}
                                                {level.slotsTotal > 0
                                                    ? ` • Slots ${
                                                          abilitySlotsUsed[levelIdx] ?? 0
                                                      }/${level.slotsTotal}`
                                                    : ''}
                                            </p>
                                            {level.items.length > 0 ? (
                                                <div className="match-spell-list">
                                                    {level.items.map((abilityName) => {
                                                        const key = `${levelIdx}-${abilityName}`;
                                                        const used = abilityUsed[key];
                                                        const blocked =
                                                            !used &&
                                                            level.slotsTotal > 0 &&
                                                            (abilitySlotsUsed[levelIdx] ??
                                                                0) >= level.slotsTotal;
                                                        return (
                                                            <span
                                                                key={abilityName}
                                                                className={`match-spell-item${
                                                                    used
                                                                        ? ' match-spell-item--used'
                                                                        : ''
                                                                }${
                                                                    blocked
                                                                        ? ' match-spell-item--blocked'
                                                                        : ''
                                                                }`}
                                                                onClick={() =>
                                                                    handleAbilityClick(
                                                                        levelIdx,
                                                                        abilityName,
                                                                        level.slotsTotal
                                                                    )
                                                                }
                                                            >
                                                                {abilityName}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="font-XXS-regular">
                                                    Sem habilidades
                                                </p>
                                            )}
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
                            imageHighlightManagerModalOpen
                                ? ' match-top-bar-item--active'
                                : ''
                        }`}
                        title="Imagem em destaque"
                        onClick={() => setImageHighlightManagerModalOpen(true)}
                    >
                        <Image
                            src={ImageHighlightSVG.src}
                            alt="Imagem em destaque"
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
                            src={EditBlueSVG.src}
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
                        onClick={handleGridToggle}
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
                <div className="match-bottom-bar-control">
                    <button
                        className={`match-bottom-bar-item${
                            !playingMusicId ? ' match-bottom-bar-item--disabled' : ''
                        }`}
                        title={
                            playingMusicId
                                ? 'Volume da música'
                                : 'Nenhuma música em reprodução'
                        }
                        onClick={() => {
                            if (!playingMusicId) return;
                            setMusicVolumeOpen((current) => !current);
                        }}
                        disabled={!playingMusicId}
                    >
                        <Image src={VolumeSVG.src} alt="Volume" width={28} height={28} />
                    </button>
                    {musicVolumeOpen && playingMusicId && (
                        <div className="match-volume-panel">
                            <span className="match-volume-label font-XXS-bold">
                                Volume
                            </span>
                            <input
                                className="match-volume-slider"
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={musicVolume}
                                onChange={(event) =>
                                    setMusicVolume(Number(event.target.value))
                                }
                                aria-label="Controlar volume da música"
                            />
                            <span className="match-volume-value font-XXS-regular">
                                {musicVolume}%
                            </span>
                        </div>
                    )}
                </div>
                {isPlayer && (
                    <button
                        className="match-bottom-bar-item"
                        title="Anotações"
                        onClick={() => setNotesModalOpen(true)}
                    >
                        <Image
                            src={EditBlueSVG.src}
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
                        handleLeaveMatch(`/campaigns/lobby?campaignId=${campaignId}`)
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
                    xpSystem={xpSystem}
                    onClose={() => setSheetModalOpen(false)}
                />
            )}

            {(panelDetailSpell !== null || panelDetailLoading) && (
                <div className="cs-spell-picker-overlay">
                    <div
                        className="cs-spell-picker-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="cs-spell-picker-header">
                            <h2 className="font-S-bold text-base">
                                {panelDetailLoading ? (
                                    <LoadingDots label="Carregando detalhes da magia" />
                                ) : (
                                    panelDetailSpell?.name
                                )}
                            </h2>
                            <button
                                type="button"
                                className="cs-spell-picker-close"
                                onClick={closeSpellDetail}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="cs-spell-picker-list">
                            {panelDetailLoading && (
                                <p className="text-center text-sm py-8">
                                    <LoadingDots label="Carregando detalhes da magia" />
                                </p>
                            )}
                            {!panelDetailLoading && panelDetailSpell && (
                                <div className="cs-spell-accordion-body border-none px-0">
                                    <p className="text-xs leading-relaxed mb-3">
                                        {panelDetailSpell.description}
                                    </p>
                                    <div className="cs-spell-accordion-fields">
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Tipo
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {panelDetailSpell.type}
                                            </span>
                                        </div>
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Tempo de Conjuração
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {panelDetailSpell.castingTime}
                                            </span>
                                        </div>
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Duração
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {panelDetailSpell.duration}
                                            </span>
                                        </div>
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Alcance
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {panelDetailSpell.range}
                                            </span>
                                        </div>
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Componentes
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {panelDetailSpell.components}
                                            </span>
                                        </div>
                                        {panelDetailSpell.higherLevels && (
                                            <div className="cs-spell-accordion-field cs-spell-accordion-field--full">
                                                <span className="cs-spell-accordion-field-label">
                                                    Em Níveis Superiores
                                                </span>
                                                <span className="cs-spell-accordion-field-value">
                                                    {panelDetailSpell.higherLevels}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="match-spell-use-btn font-XS-bold"
                                        onClick={handleUseSpell}
                                    >
                                        Usar Magia
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {selectedMapCharacterId && campaignId && (
                <CharacterDetailModal
                    key={`${selectedMapCharacterId}-${characterDetailRefreshVersion}`}
                    characterId={selectedMapCharacterId}
                    campaignId={campaignId}
                    isMaster={isMaster}
                    xpSystem={xpSystem}
                    onBack={() => setSelectedMapCharacterId(null)}
                />
            )}

            {mediaModalOpen && (
                <MatchMediaModal
                    musics={musics}
                    mapImages={mapImages}
                    selectedMusic={playingMusicId}
                    onMusicSelect={handleMusicSelection}
                    onClose={() => setMediaModalOpen(false)}
                    onMapSelect={handleMapSelection}
                />
            )}

            {imageHighlightManagerModalOpen && (
                <MatchImageHighlightManagerModal
                    images={matchImages}
                    highlightedImageId={highlightedMatchImage?.id ?? null}
                    isUploading={imageHighlightUploading}
                    selectingImageId={selectingHighlightedImageId}
                    onClose={() => setImageHighlightManagerModalOpen(false)}
                    onUpload={handleUploadMatchImage}
                    onSelect={handleSelectMatchHighlightedImage}
                />
            )}

            {imageHighlightViewerOpen && highlightedMatchImage && (
                <MatchImageHighlightViewerModal
                    image={highlightedMatchImage}
                    onClose={() => setImageHighlightViewerOpen(false)}
                />
            )}

            {cloneLifeEditor && (
                <div className="match-clone-life-overlay">
                    <div
                        className="match-clone-life-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="match-clone-life-header">
                            <div>
                                <h2 className="font-L-bold match-clone-life-title">
                                    Vida do Clone
                                </h2>
                                <p className="font-XXS-regular match-clone-life-subtitle">
                                    Ajuste a vida atual de {cloneLifeEditor.characterName}
                                    .
                                </p>
                            </div>
                            <button
                                type="button"
                                className="match-clone-life-close"
                                onClick={() => {
                                    setCloneLifeEditor(null);
                                    setCloneLifeInput('');
                                }}
                                aria-label="Fechar"
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
                        <div className="match-clone-life-body">
                            <label
                                htmlFor="match-clone-life-input"
                                className="font-XS-bold match-clone-life-label"
                            >
                                Pontos de vida
                            </label>
                            <input
                                id="match-clone-life-input"
                                type="number"
                                min="0"
                                inputMode="numeric"
                                className="match-clone-life-input font-S-bold"
                                value={cloneLifeInput}
                                onChange={(event) =>
                                    setCloneLifeInput(event.target.value)
                                }
                                placeholder="Informe a vida atual"
                            />
                        </div>
                        <div className="match-clone-life-actions">
                            <button
                                type="button"
                                className="match-clone-life-confirm font-XS-bold"
                                onClick={handleCloneLifeSave}
                            >
                                Confirmar
                            </button>
                            <button
                                type="button"
                                className="match-clone-life-cancel font-XS-regular"
                                onClick={() => {
                                    setCloneLifeEditor(null);
                                    setCloneLifeInput('');
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
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
                    onToggleEffect={handleEffectToggle}
                />
            )}

            {avatarSelectionModalOpen && (
                <MatchAvatarSelectionModal
                    characters={searchedCampaignCharacters}
                    searchValue={avatarSearch}
                    visibleCharacterIds={visibleMapCharacterIds}
                    disableRemoveAllAvatars={
                        visibleMapCharacterIds.length === 0 &&
                        clonedMapTokens.length === 0
                    }
                    disableRemoveAllClones={clonedMapTokens.length === 0}
                    onClose={() => setAvatarSelectionModalOpen(false)}
                    onRemoveAllAvatars={handleRemoveAllAvatars}
                    onRemoveAllClones={handleRemoveAllClones}
                    onSearchChange={setAvatarSearch}
                    onToggleCharacter={(characterId) =>
                        handleVisibleCharacterIdsChange(
                            visibleMapCharacterIds.includes(characterId)
                                ? visibleMapCharacterIds.filter(
                                      (id) => id !== characterId
                                  )
                                : [...visibleMapCharacterIds, characterId]
                        )
                    }
                />
            )}

            {journalHighlightModalOpen && (
                <div className="match-journal-highlight-overlay">
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
                                    <LoadingDots label="Carregando publicações" />
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
                                {journalHighlightSaving ? (
                                    <LoadingDots label="Salvando destaque" />
                                ) : (
                                    'Clique novamente em uma publicação destacada para remove-la.'
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {journalHighlightNoticeOpen && (
                <div className="match-journal-highlight-overlay">
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
                    ref={musicPlayerFrameRef}
                    key={playingMusicId}
                    src={`https://www.youtube.com/embed/${playingMusicId}?autoplay=1&loop=1&playlist=${playingMusicId}&enablejsapi=1&controls=0`}
                    allow="autoplay; encrypted-media"
                    className="hidden"
                    onLoad={() => applyMusicVolume(musicVolume)}
                />
            )}
        </div>
    );
}
