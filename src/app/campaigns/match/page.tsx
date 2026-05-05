'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { DiceRoller } from 'rpg-dice-roller';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCampaignById } from '@/server/campaigns/join-campaign';
import {
    getCharacterById,
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
import MatchMediaModal from '@/components/lobby/MatchMediaModal';
import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import LogoSVG from '../../../../assets/icons/logo-blue.svg?url';
import SheetSVG from '../../../../assets/icons/menu-panel-lobby/sheet.svg?url';
import MediaSVG from '../../../../assets/icons/menu-panel-lobby/media.svg?url';
import LeftPanelOpenSVG from '../../../../assets/icons/game/left-panel-open.svg?url';
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

function signed(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
}

export default function MatchPage(): JSX.Element {
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId') ?? '';
    const router = useRouter();
    const [backgroundImage, setBackgroundImage] = useState<string>(
        SideImageBackground.src
    );
    const [sheetModalOpen, setSheetModalOpen] = useState(false);
    const [isMaster, setIsMaster] = useState(false);
    const [isPlayer, setIsPlayer] = useState(false);
    const [gridVisible, setGridVisible] = useState(true);
    const [diceTrayOpen, setDiceTrayOpen] = useState(false);
    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [musics, setMusics] = useState<CampaignMusic[]>([]);
    const [mapImages, setMapImages] = useState<{ link: string }[]>([]);
    const [playingMusicId, setPlayingMusicId] = useState<string | null>(null);
    const [charPanelOpen, setCharPanelOpen] = useState(false);
    const [charPanelTab, setCharPanelTab] = useState<'resumo' | 'magias' | 'habilidades'>(
        'resumo'
    );
    const [myCharacters, setMyCharacters] = useState<CampaignCharacter[]>([]);
    const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
    const [selectedCharacter, setSelectedCharacter] = useState<FullCharacterDnd | null>(
        null
    );
    const [characterLoading, setCharacterLoading] = useState(false);
    const [className, setClassName] = useState('');
    const [raceName, setRaceName] = useState('');
    const [spellNameMap, setSpellNameMap] = useState<Record<string, string>>({});

    const diceOptions = [
        { label: 'D20', icon: D20SVG, sides: 20 },
        { label: 'D12', icon: D12SVG, sides: 12 },
        { label: 'D10', icon: D10SVG, sides: 10 },
        { label: 'D8', icon: D8SVG, sides: 8 },
        { label: 'D6', icon: D6SVG, sides: 6 },
        { label: 'D4', icon: D4SVG, sides: 4 },
    ];

    const diceRollerRef = useRef(new DiceRoller());
    const [dicePickerState, setDicePickerState] = useState<{
        sides: number;
        label: string;
        icon: string;
        count: number;
    } | null>(null);
    const [throwState, setThrowState] = useState<{
        icon: string;
        label: string;
        rolls: number[] | null;
        total: number | null;
    } | null>(null);

    const selectDie = (sides: number, label: string, iconSrc: string) => {
        setDicePickerState((prev) =>
            prev?.label === label ? null : { sides, label, icon: iconSrc, count: 1 }
        );
    };

    const rollDice = () => {
        if (!dicePickerState || throwState) return;
        const { count, sides, label, icon } = dicePickerState;
        const result = diceRollerRef.current.roll(`${count}d${sides}`);
        const rolls = result.rolls[0]?.rolls?.map((r) => r.value) ?? [];
        const rollLabel = count > 1 ? `${count}${label}` : label;
        setDicePickerState(null);
        setThrowState({ icon, label: rollLabel, rolls: null, total: null });
        setTimeout(() => {
            setThrowState((prev) =>
                prev ? { ...prev, rolls, total: result.total } : null
            );
        }, 950);
        setTimeout(() => {
            setThrowState(null);
        }, 3000);
    };

    const userInfo =
        typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('userLogged') as string)
            : null;

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
                setIsMaster(role === 'master' || role === 'dungeon_master');
                setIsPlayer(role === 'player' || role === 'admin_player');
            }
        });
    }, [campaignId, userInfo]);

    useEffect(() => {
        if (!campaignId || !userInfo?.userId) return;
        getCharactersByPlayer(campaignId).then((data) => {
            const mine = data.filter((char) => char.authorUserId === userInfo.userId);
            setMyCharacters(mine);

            if (mine.length === 1) {
                setSelectedCharacterId(mine[0].id);
            }
        });
    }, [campaignId, userInfo]);

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

    return (
        <div
            className="match-page"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
            }}
        >
            {/* Grid overlay */}
            {gridVisible && <div className="match-grid" />}

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

                                    <div className="match-char-section">
                                        <p className="font-XXS-bold">Proficiências</p>
                                        <p className="font-XXS-regular">
                                            {profile.characteristics?.other
                                                ?.proficiencies || 'Não informado'}
                                        </p>
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
            <nav className="match-top-bar">
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
                    <Image src={SheetSVG.src} alt="Fichas" width={28} height={28} />
                </button>
            </nav>

            {/* Bottom-left: vertical action bar */}
            <nav className="match-bottom-bar">
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

            {/* Full-screen dice throw overlay */}
            <AnimatePresence>
                {throwState && (
                    <div
                        className="match-throw-overlay"
                        onClick={() => setThrowState(null)}
                    >
                        <motion.div
                            className="match-throw-die"
                            initial={{ y: '-60vh', rotate: -180, scale: 1.4, opacity: 0 }}
                            animate={{
                                y: ['-60vh', '0vh', '-8vh', '0vh', '-3vh', '0vh'],
                                rotate: [-180, 360, 280, 340, 320, 330],
                                scale: [1.4, 1, 1.08, 1, 1.03, 1],
                                opacity: [0, 1, 1, 1, 1, 1],
                            }}
                            transition={{
                                duration: 0.95,
                                times: [0, 0.55, 0.7, 0.82, 0.92, 1],
                                ease: 'easeOut',
                            }}
                        >
                            <Image
                                src={throwState.icon}
                                alt={throwState.label}
                                width={140}
                                height={140}
                                style={{
                                    filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.55))',
                                }}
                            />
                            <AnimatePresence>
                                {throwState.total !== null && (
                                    <motion.span
                                        className="match-throw-result font-XL-bold"
                                        initial={{ opacity: 0, scale: 0.4 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.25, ease: 'backOut' }}
                                        style={{
                                            fontSize:
                                                (throwState.total ?? 0) >= 100
                                                    ? '2rem'
                                                    : '3.5rem',
                                        }}
                                    >
                                        {throwState.total}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>
                        <AnimatePresence>
                            {throwState.total !== null && (
                                <motion.div
                                    className="match-throw-details"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <span className="match-throw-label font-S-bold">
                                        {throwState.label}
                                    </span>
                                    {(throwState.rolls?.length ?? 0) > 1 && (
                                        <div className="match-throw-rolls">
                                            {throwState.rolls!.map((r, i) => (
                                                <span
                                                    key={i}
                                                    className="match-throw-roll-badge font-XXS-bold"
                                                >
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </AnimatePresence>

            {sheetModalOpen && campaignId && userInfo?.userId && (
                <CharacterSheetModal
                    campaignId={campaignId}
                    userId={userInfo.userId}
                    isPlayer={isPlayer}
                    isMaster={isMaster}
                    onClose={() => setSheetModalOpen(false)}
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
