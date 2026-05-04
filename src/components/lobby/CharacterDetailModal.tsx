'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import EditIcon from '@assets/icons/sys/edit.svg?url';
import {
    getCharacterById,
    type FullCharacterDnd,
} from '@/server/characters/get-characters';
import {
    getDnd5eClassById,
    getDnd5eRaceById,
    getDnd5eSpellById,
} from '@/server/dungeons&dragons5e/system';
import '@/components/lobby/styles/CharacterDetailModal.css';
import '@/app/campaigns/character-sheet/page.css';
import SheetMagias, {
    type SheetMagiasHandle,
} from '@/components/character-sheet/SheetMagias';
import SheetHabilidades, {
    type SheetHabilidadesHandle,
} from '@/components/character-sheet/SheetHabilidades';
import { updateCharacter } from '@/server/characters/update-character';
import { uploadCharacterPicture } from '@/server/characters/upload-character-picture';

interface CharacterDetailModalProps {
    characterId: string;
    campaignId: string;
    isMaster?: boolean;
    onBack: () => void;
}

const ABILITY_LABELS: Record<string, string> = {
    str: 'FOR',
    dex: 'DES',
    con: 'CON',
    int: 'INT',
    wis: 'SAB',
    cha: 'CAR',
};

const ABILITY_FULL: Record<string, string> = {
    str: 'Força',
    dex: 'Destreza',
    con: 'Constituição',
    int: 'Inteligência',
    wis: 'Sabedoria',
    cha: 'Carisma',
};

function modifier(value: number): string {
    const mod = Math.floor((value - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

const SPELL_LEVELS = [
    { level: 0, label: 'Truques', slots: false },
    { level: 1, label: '1', slots: true },
    { level: 2, label: '2', slots: true },
    { level: 3, label: '3', slots: true },
    { level: 4, label: '4', slots: true },
    { level: 5, label: '5', slots: true },
    { level: 6, label: '6', slots: true },
    { level: 7, label: '7', slots: true },
    { level: 8, label: '8', slots: true },
    { level: 9, label: '9', slots: true },
] as const;

const SPELLS_PER_LEVEL = 8;

const ABILITY_LEVELS = [
    { level: 0, label: 'Truques', slots: false },
    { level: 1, label: '1', slots: true },
    { level: 2, label: '2', slots: true },
    { level: 3, label: '3', slots: true },
    { level: 4, label: '4', slots: true },
    { level: 5, label: '5', slots: true },
    { level: 6, label: '6', slots: true },
    { level: 7, label: '7', slots: true },
    { level: 8, label: '8', slots: true },
    { level: 9, label: '9', slots: true },
] as const;

const ABILITIES_PER_LEVEL = 8;

export default function CharacterDetailModal({
    characterId,
    campaignId,
    isMaster = false,
    onBack,
}: CharacterDetailModalProps): JSX.Element {
    const [char, setChar] = useState<FullCharacterDnd | null>(null);
    const [loading, setLoading] = useState(true);
    const [className, setClassName] = useState('');
    const [raceName, setRaceName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const editMagiasRef = useRef<SheetMagiasHandle>(null);
    const editHabilidadesRef = useRef<SheetHabilidadesHandle>(null);
    const pictureInputRef = useRef<HTMLInputElement>(null);

    // Edit form states
    const [editAbilityScores, setEditAbilityScores] = useState<
        Array<{ ability: string; value: number; modifier: number; proficiency: boolean }>
    >([]);
    const [editCombat, setEditCombat] = useState({
        armorClass: 0,
        initiative: 0,
        speed: 0,
        passiveWisdom: 0,
        hitPointsMax: 0,
        hitPointsCurrent: 0,
        hitPointsTemp: 0,
    });
    const [editPersonality, setEditPersonality] = useState({
        personalityTraits: '',
        ideals: '',
        bonds: '',
        flaws: '',
    });
    const [editAppearance, setEditAppearance] = useState({
        age: '',
        height: '',
        weight: '',
        eyes: '',
        skin: '',
        hair: '',
    });
    const [editEquipments, setEditEquipments] = useState('');
    const [editMoney, setEditMoney] = useState({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });
    const [editHistorico, setEditHistorico] = useState({
        backstory: '',
        alliesAndOrgs: '',
        treasure: '',
    });

    const handleStartEdit = () => {
        if (!char || !profile || !stats) return;
        setEditAbilityScores(stats.abilityScores.map((ab) => ({ ...ab })));
        setEditCombat({
            armorClass: stats.armorClass,
            initiative: stats.initiative,
            speed: stats.speed,
            passiveWisdom: stats.passiveWisdom,
            hitPointsMax: stats.hitPoints.points,
            hitPointsCurrent: stats.hitPoints.currentPoints,
            hitPointsTemp: stats.hitPoints.tempPoints,
        });
        setEditPersonality({
            personalityTraits: profile.characteristics?.personalityTraits ?? '',
            ideals: profile.characteristics?.ideals ?? '',
            bonds: profile.characteristics?.bonds ?? '',
            flaws: profile.characteristics?.flaws ?? '',
        });
        const app = profile.characteristics?.appearance;
        setEditAppearance({
            age: app?.age ?? '',
            height: app?.height ?? '',
            weight: app?.weight ?? '',
            eyes: app?.eyes ?? '',
            skin: app?.skin ?? '',
            hair: app?.hair ?? '',
        });
        setEditEquipments(char.data.equipments ?? '');
        setEditMoney(char.data.money ?? { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });
        setEditHistorico({
            backstory: profile.characteristics?.backstory ?? '',
            alliesAndOrgs: profile.characteristics?.alliesAndOrgs ?? '',
            treasure: profile.characteristics?.treasure ?? '',
        });
        setIsEditing(true);
    };

    const handlePictureClick = () => {
        pictureInputRef.current?.click();
    };

    const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const success = await uploadCharacterPicture(characterId, file);
        if (success) {
            const updated = await getCharacterById(characterId);
            if (updated) setChar(updated);
        }
        e.target.value = '';
    };

    const handleSave = async () => {
        if (!char) return;
        setSaving(true);
        const m = editMagiasRef.current?.getData();
        const h = editHabilidadesRef.current?.getData();
        const numMod = (v: number) => Math.floor((v - 10) / 2);
        const makeSpellLevel = (l: number) => ({
            spellIds: (m?.spellNames[l] ?? [])
                .filter((e) => e.spellId)
                .map((e) => e.spellId),
            slotsTotal: m?.slotTotals[l] ?? 0,
            slotsExpended: m?.slotsExpended[l] ?? 0,
        });
        const makeAbilityLevel = (l: number) => ({
            extraAbilityNames: (h?.abilityNames[l] ?? []).filter(Boolean),
            slotsTotal: Number(h?.slotsTotal[l]) || 0,
            slotsExpended: h?.slotsExpended[l] ?? 0,
        });
        const payload = {
            data: {
                profile: {
                    characteristics: {
                        personalityTraits: editPersonality.personalityTraits,
                        ideals: editPersonality.ideals,
                        bonds: editPersonality.bonds,
                        flaws: editPersonality.flaws,
                        appearance: editAppearance,
                        backstory: editHistorico.backstory,
                        alliesAndOrgs: editHistorico.alliesAndOrgs,
                        treasure: editHistorico.treasure,
                        other: char.data.profile.characteristics?.other ?? {},
                    },
                },
                stats: {
                    abilityScores: editAbilityScores.map((ab) => ({
                        ability: ab.ability,
                        value: ab.value,
                        modifier: numMod(ab.value),
                        proficiency: ab.proficiency,
                    })),
                    armorClass: editCombat.armorClass,
                    initiative: editCombat.initiative,
                    speed: editCombat.speed,
                    passiveWisdom: editCombat.passiveWisdom,
                    hitPoints: {
                        points: editCombat.hitPointsMax,
                        currentPoints: editCombat.hitPointsCurrent,
                        tempPoints: editCombat.hitPointsTemp,
                        dicePoints: char.data.stats.hitPoints.dicePoints,
                    },
                },
                money: editMoney,
                equipments: editEquipments,
                ...(m && {
                    spells: {
                        cantrips: (m.spellNames[0] ?? [])
                            .filter((e) => e.spellId)
                            .map((e) => e.spellId),
                        1: makeSpellLevel(1),
                        2: makeSpellLevel(2),
                        3: makeSpellLevel(3),
                        4: makeSpellLevel(4),
                        5: makeSpellLevel(5),
                        6: makeSpellLevel(6),
                        7: makeSpellLevel(7),
                        8: makeSpellLevel(8),
                        9: makeSpellLevel(9),
                    },
                }),
                ...(h && {
                    extraAbilities: {
                        cantrips: (h.abilityNames[0] ?? []).filter(Boolean),
                        1: makeAbilityLevel(1),
                        2: makeAbilityLevel(2),
                        3: makeAbilityLevel(3),
                        4: makeAbilityLevel(4),
                        5: makeAbilityLevel(5),
                        6: makeAbilityLevel(6),
                        7: makeAbilityLevel(7),
                        8: makeAbilityLevel(8),
                        9: makeAbilityLevel(9),
                    },
                }),
            },
        };
        const success = await updateCharacter(
            characterId,
            payload as Record<string, unknown>
        );
        if (success) {
            const updated = await getCharacterById(characterId);
            if (updated) setChar(updated);
            setIsEditing(false);
        }
        setSaving(false);
    };
    const [activeTab, setActiveTab] = useState<'principal' | 'magias' | 'habilidades'>(
        'principal'
    );
    const [spellNameMap, setSpellNameMap] = useState<Record<string, string>>({});

    useEffect(() => {
        getCharacterById(characterId)
            .then(async (result) => {
                setChar(result);
                if (result?.data?.profile) {
                    const { class: classId, race: raceId } = result.data.profile;
                    const [classData, raceData] = await Promise.all([
                        classId ? getDnd5eClassById(classId) : null,
                        raceId ? getDnd5eRaceById(raceId) : null,
                    ]);
                    if (classData?.pt?.name) setClassName(classData.pt.name);
                    if (raceData?.pt?.name) setRaceName(raceData.pt.name);
                }
                const spellsData = (result?.data?.spells as any) ?? null;
                if (spellsData) {
                    const ids: string[] = [];
                    if (Array.isArray(spellsData.cantrips))
                        ids.push(...spellsData.cantrips);
                    for (let l = 1; l <= 9; l++) {
                        const lvl = spellsData[l];
                        if (Array.isArray(lvl?.spellIds)) ids.push(...lvl.spellIds);
                    }
                    if (ids.length > 0) {
                        const results = await Promise.all(
                            ids.map((id: string) => getDnd5eSpellById(id))
                        );
                        const map: Record<string, string> = {};
                        results.forEach((r: any, i: number) => {
                            if (r?.pt?.name) map[ids[i]] = r.pt.name;
                        });
                        setSpellNameMap(map);
                    }
                }
            })
            .finally(() => setLoading(false));
    }, [characterId]);

    const profile = char?.data?.profile;
    const stats = char?.data?.stats;
    const appearance = profile?.characteristics?.appearance;
    const picture = profile?.characteristics.appearance?.picture?.link;

    const loggedUserId =
        typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('userLogged') ?? 'null')?.userId
            : null;
    const isAuthor = !!loggedUserId && loggedUserId === char?.author?.userId;
    const canEdit = isAuthor || isMaster;

    return (
        <div className="cdm-overlay" onClick={onBack}>
            <div className="cdm-modal" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className="cdm-back-btn font-XS-bold"
                    onClick={onBack}
                >
                    ← Voltar
                </button>

                {loading && (
                    <span className="font-XS-regular cdm-loading">
                        Carregando ficha...
                    </span>
                )}

                {!loading && !char && (
                    <span className="font-XS-regular cdm-loading">
                        Não foi possível carregar a ficha.
                    </span>
                )}

                {!loading && char && profile && stats && (
                    <>
                        {/* ── Header ─────────────────────── */}
                        <div className="cdm-header">
                            <div className="cdm-picture-wrapper">
                                <Image
                                    src={picture as string}
                                    alt={profile.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                                {canEdit && (
                                    <div
                                        className="cdm-picture-overlay"
                                        onClick={handlePictureClick}
                                    >
                                        <Image
                                            src={EditIcon}
                                            alt="edit"
                                            width={32}
                                            height={32}
                                        />
                                    </div>
                                )}
                                <input
                                    ref={pictureInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePictureChange}
                                />
                            </div>
                            <div className="cdm-header-info">
                                <div className="cdm-name-row">
                                    <h2 className="font-L-semibold cdm-char-name">
                                        {profile.name}
                                    </h2>
                                    {canEdit && (
                                        <button
                                            type="button"
                                            className="button-L-fill font-XS-bold cdm-edit-btn"
                                            onClick={() =>
                                                isEditing
                                                    ? handleSave()
                                                    : handleStartEdit()
                                            }
                                            disabled={saving}
                                        >
                                            {isEditing
                                                ? saving
                                                    ? 'Salvando...'
                                                    : 'Salvar Ficha'
                                                : 'Atualizar Ficha'}
                                        </button>
                                    )}
                                </div>
                                <div className="cdm-badges">
                                    <span className="cdm-badge font-XXS-bold">
                                        Nível {profile.level}
                                    </span>
                                    <span className="cdm-badge font-XXS-bold">
                                        {className || profile.class}
                                    </span>
                                    <span className="cdm-badge font-XXS-bold">
                                        {raceName || profile.race}
                                    </span>
                                </div>
                                <div className="cdm-header-meta">
                                    <span className="font-XS-regular">
                                        <span className="cdm-label">Tendência:</span>{' '}
                                        {profile.characteristics?.alignment ?? '—'}
                                    </span>
                                    <span className="font-XS-regular">
                                        <span className="cdm-label">Antecedente:</span> —
                                    </span>
                                    <span className="font-XS-regular">
                                        <span className="cdm-label">XP:</span>{' '}
                                        {profile.xp ?? 0}
                                    </span>
                                    <span className="font-XS-regular">
                                        <span className="cdm-label">Player:</span>{' '}
                                        {char.author?.nickname ?? '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* ── Tabs ─────────────────────── */}
                        <div className="cdm-tabs">
                            {(['principal', 'magias', 'habilidades'] as const).map(
                                (tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        className={`cdm-tab font-XS-bold${
                                            activeTab === tab ? ' cdm-tab--active' : ''
                                        }`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab === 'principal'
                                            ? 'Principal'
                                            : tab === 'magias'
                                            ? 'Magias'
                                            : 'Habilidades'}
                                    </button>
                                )
                            )}
                        </div>
                        {/* ── Principal tab ─────────────── */}
                        {activeTab === 'principal' && (
                            <>
                                {/* ── Atributos ──────────────────── */}
                                <div className="cdm-section">
                                    <h3 className="font-M-semibold cdm-section-title">
                                        Atributos
                                    </h3>
                                    <div className="cdm-attributes-grid">
                                        {(isEditing
                                            ? editAbilityScores
                                            : stats.abilityScores
                                        ).map((ab, idx) => (
                                            <div
                                                key={ab.ability}
                                                className="cdm-attr-box"
                                            >
                                                <span className="font-XXS-bold cdm-attr-label">
                                                    {ABILITY_LABELS[ab.ability] ??
                                                        ab.ability.toUpperCase()}
                                                </span>
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="cdm-edit-number font-L-semibold cdm-attr-value"
                                                        value={
                                                            editAbilityScores[idx]
                                                                ?.value ?? 0
                                                        }
                                                        onChange={(e) => {
                                                            const v = Number(
                                                                e.target.value
                                                            );
                                                            setEditAbilityScores((prev) =>
                                                                prev.map((a, i) =>
                                                                    i === idx
                                                                        ? {
                                                                              ...a,
                                                                              value: v,
                                                                          }
                                                                        : a
                                                                )
                                                            );
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="font-L-semibold cdm-attr-value">
                                                        {ab.value}
                                                    </span>
                                                )}
                                                <span className="font-XS-regular cdm-attr-modifier">
                                                    {modifier(
                                                        isEditing
                                                            ? editAbilityScores[idx]
                                                                  ?.value ?? 0
                                                            : ab.value
                                                    )}
                                                </span>
                                                <span className="font-XXS-regular cdm-attr-full">
                                                    {ABILITY_FULL[ab.ability] ?? ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Combate ────────────────────── */}
                                <div className="cdm-section">
                                    <h3 className="font-M-semibold cdm-section-title">
                                        Combate
                                    </h3>
                                    <div className="cdm-info-grid">
                                        <div className="cdm-info-box">
                                            <span className="font-XXS-regular cdm-info-label">
                                                CA
                                            </span>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="cdm-edit-number font-M-semibold"
                                                    value={editCombat.armorClass}
                                                    onChange={(e) =>
                                                        setEditCombat((p) => ({
                                                            ...p,
                                                            armorClass: Number(
                                                                e.target.value
                                                            ),
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                <span className="font-M-semibold">
                                                    {stats.armorClass}
                                                </span>
                                            )}
                                        </div>
                                        <div className="cdm-info-box">
                                            <span className="font-XXS-regular cdm-info-label">
                                                Iniciativa
                                            </span>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="cdm-edit-number font-M-semibold"
                                                    value={editCombat.initiative}
                                                    onChange={(e) =>
                                                        setEditCombat((p) => ({
                                                            ...p,
                                                            initiative: Number(
                                                                e.target.value
                                                            ),
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                <span className="font-M-semibold">
                                                    {stats.initiative >= 0
                                                        ? `+${stats.initiative}`
                                                        : stats.initiative}
                                                </span>
                                            )}
                                        </div>
                                        <div className="cdm-info-box">
                                            <span className="font-XXS-regular cdm-info-label">
                                                Velocidade
                                            </span>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="cdm-edit-number font-M-semibold"
                                                    value={editCombat.speed}
                                                    onChange={(e) =>
                                                        setEditCombat((p) => ({
                                                            ...p,
                                                            speed: Number(e.target.value),
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                <span className="font-M-semibold">
                                                    {stats.speed} m
                                                </span>
                                            )}
                                        </div>
                                        <div className="cdm-info-box">
                                            <span className="font-XXS-regular cdm-info-label">
                                                PV Máx
                                            </span>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="cdm-edit-number font-M-semibold"
                                                    value={editCombat.hitPointsMax}
                                                    onChange={(e) =>
                                                        setEditCombat((p) => ({
                                                            ...p,
                                                            hitPointsMax: Number(
                                                                e.target.value
                                                            ),
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                <span className="font-M-semibold">
                                                    {stats.hitPoints.points}
                                                </span>
                                            )}
                                        </div>
                                        <div className="cdm-info-box">
                                            <span className="font-XXS-regular cdm-info-label">
                                                PV Atual
                                            </span>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="cdm-edit-number font-M-semibold"
                                                    value={editCombat.hitPointsCurrent}
                                                    onChange={(e) =>
                                                        setEditCombat((p) => ({
                                                            ...p,
                                                            hitPointsCurrent: Number(
                                                                e.target.value
                                                            ),
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                <span className="font-M-semibold">
                                                    {stats.hitPoints.currentPoints}
                                                </span>
                                            )}
                                        </div>
                                        <div className="cdm-info-box">
                                            <span className="font-XXS-regular cdm-info-label">
                                                PV Temp
                                            </span>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="cdm-edit-number font-M-semibold"
                                                    value={editCombat.hitPointsTemp}
                                                    onChange={(e) =>
                                                        setEditCombat((p) => ({
                                                            ...p,
                                                            hitPointsTemp: Number(
                                                                e.target.value
                                                            ),
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                <span className="font-M-semibold">
                                                    {stats.hitPoints.tempPoints}
                                                </span>
                                            )}
                                        </div>
                                        <div className="cdm-info-box">
                                            <span className="font-XXS-regular cdm-info-label">
                                                Dados de Vida
                                            </span>
                                            <span className="font-M-semibold">
                                                {stats.hitPoints.dicePoints}
                                            </span>
                                        </div>
                                        <div className="cdm-info-box">
                                            <span className="font-XXS-regular cdm-info-label">
                                                Proficiência
                                            </span>
                                            <span className="font-M-semibold">
                                                +{stats.proficiencyBonus}
                                            </span>
                                        </div>
                                        <div className="cdm-info-box">
                                            <span className="font-XXS-regular cdm-info-label">
                                                Percepção Passiva
                                            </span>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="cdm-edit-number font-M-semibold"
                                                    value={editCombat.passiveWisdom}
                                                    onChange={(e) =>
                                                        setEditCombat((p) => ({
                                                            ...p,
                                                            passiveWisdom: Number(
                                                                e.target.value
                                                            ),
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                <span className="font-M-semibold">
                                                    {stats.passiveWisdom}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ── Personalidade ──────────────── */}
                                {(profile.characteristics?.personalityTraits ||
                                    profile.characteristics?.ideals ||
                                    profile.characteristics?.bonds ||
                                    profile.characteristics?.flaws) && (
                                    <div className="cdm-section">
                                        <h3 className="font-M-semibold cdm-section-title">
                                            Personalidade
                                        </h3>
                                        <div className="cdm-text-grid">
                                            {profile.characteristics
                                                ?.personalityTraits && (
                                                <div className="cdm-text-block">
                                                    <span className="font-XS-bold cdm-label">
                                                        Traços de Personalidade
                                                    </span>
                                                    <p className="font-XS-regular cdm-text-content">
                                                        {
                                                            profile.characteristics
                                                                .personalityTraits
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                            {profile.characteristics?.ideals && (
                                                <div className="cdm-text-block">
                                                    <span className="font-XS-bold cdm-label">
                                                        Ideais
                                                    </span>
                                                    <p className="font-XS-regular cdm-text-content">
                                                        {profile.characteristics.ideals}
                                                    </p>
                                                </div>
                                            )}
                                            {profile.characteristics?.bonds && (
                                                <div className="cdm-text-block">
                                                    <span className="font-XS-bold cdm-label">
                                                        Vínculos
                                                    </span>
                                                    <p className="font-XS-regular cdm-text-content">
                                                        {profile.characteristics.bonds}
                                                    </p>
                                                </div>
                                            )}
                                            {profile.characteristics?.flaws && (
                                                <div className="cdm-text-block">
                                                    <span className="font-XS-bold cdm-label">
                                                        Falhas
                                                    </span>
                                                    <p className="font-XS-regular cdm-text-content">
                                                        {profile.characteristics.flaws}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── Aparência ──────────────────── */}
                                {(isEditing || appearance) && (
                                    <div className="cdm-section">
                                        <h3 className="font-M-semibold cdm-section-title">
                                            Aparência
                                        </h3>
                                        <div className="cdm-info-grid">
                                            {(
                                                [
                                                    'age',
                                                    'height',
                                                    'weight',
                                                    'eyes',
                                                    'skin',
                                                    'hair',
                                                ] as const
                                            ).map((field) => {
                                                const labels: Record<string, string> = {
                                                    age: 'Idade',
                                                    height: 'Altura',
                                                    weight: 'Peso',
                                                    eyes: 'Olhos',
                                                    skin: 'Pele',
                                                    hair: 'Cabelo',
                                                };
                                                const rawVal = isEditing
                                                    ? editAppearance[field]
                                                    : appearance?.[field] ?? '';
                                                if (!isEditing && !rawVal) return null;
                                                const display =
                                                    !isEditing && field === 'height'
                                                        ? `${Number(rawVal) / 100} m`
                                                        : !isEditing && field === 'weight'
                                                        ? `${rawVal} Kg`
                                                        : rawVal;
                                                return (
                                                    <div
                                                        key={field}
                                                        className="cdm-info-box"
                                                    >
                                                        <span className="font-XXS-regular cdm-info-label">
                                                            {labels[field]}
                                                        </span>
                                                        {isEditing ? (
                                                            <input
                                                                className="cdm-edit-text font-S-bold"
                                                                value={
                                                                    editAppearance[field]
                                                                }
                                                                onChange={(e) =>
                                                                    setEditAppearance(
                                                                        (p) => ({
                                                                            ...p,
                                                                            [field]:
                                                                                e.target
                                                                                    .value,
                                                                        })
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            <span className="font-S-bold">
                                                                {display}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ── Ataques ────────────────────── */}
                                {char.data.attacks?.length > 0 && (
                                    <div className="cdm-section">
                                        <h3 className="font-M-semibold cdm-section-title">
                                            Ataques
                                        </h3>
                                        <div className="cdm-attacks-table">
                                            <div className="cdm-attacks-header">
                                                <span className="font-XXS-bold">
                                                    Nome
                                                </span>
                                                <span className="font-XXS-bold">
                                                    Bônus de Ataque
                                                </span>
                                                <span className="font-XXS-bold">
                                                    Dano
                                                </span>
                                            </div>
                                            {char.data.attacks.map((atk, i) => (
                                                <div key={i} className="cdm-attacks-row">
                                                    <span className="font-XS-regular">
                                                        {atk.name || '—'}
                                                    </span>
                                                    <span className="font-XS-regular">
                                                        {atk.atkBonus || '—'}
                                                    </span>
                                                    <span className="font-XS-regular">
                                                        {atk.damage || '—'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Equipamentos & Dinheiro ────── */}
                                {(isEditing ||
                                    char.data.equipments ||
                                    char.data.money) && (
                                    <div className="cdm-section">
                                        <h3 className="font-M-semibold cdm-section-title">
                                            Equipamentos &amp; Dinheiro
                                        </h3>
                                        <div className="cdm-text-block">
                                            <span className="font-XS-bold cdm-label">
                                                Inventário
                                            </span>
                                            {isEditing ? (
                                                <textarea
                                                    className="cdm-edit-textarea font-XS-regular"
                                                    rows={4}
                                                    value={editEquipments}
                                                    onChange={(e) =>
                                                        setEditEquipments(e.target.value)
                                                    }
                                                />
                                            ) : (
                                                char.data.equipments && (
                                                    <p className="font-XS-regular cdm-text-content">
                                                        {char.data.equipments}
                                                    </p>
                                                )
                                            )}
                                        </div>
                                        <div className="cdm-money-grid">
                                            {(
                                                ['cp', 'sp', 'ep', 'gp', 'pp'] as const
                                            ).map((coin) => (
                                                <div key={coin} className="cdm-info-box">
                                                    <span className="font-XXS-regular cdm-info-label">
                                                        {coin.toUpperCase()}
                                                    </span>
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            className="cdm-edit-number font-S-bold"
                                                            value={editMoney[coin]}
                                                            onChange={(e) =>
                                                                setEditMoney((p) => ({
                                                                    ...p,
                                                                    [coin]: Number(
                                                                        e.target.value
                                                                    ),
                                                                }))
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="font-S-bold">
                                                            {char.data.money?.[coin] ?? 0}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Histórico ──────────────────── */}
                                {(isEditing ||
                                    profile.characteristics?.backstory ||
                                    profile.characteristics?.alliesAndOrgs ||
                                    profile.characteristics?.treasure) && (
                                    <div className="cdm-section">
                                        <h3 className="font-M-semibold cdm-section-title">
                                            Histórico
                                        </h3>
                                        <div className="cdm-text-grid">
                                            {(
                                                [
                                                    'backstory',
                                                    'alliesAndOrgs',
                                                    'treasure',
                                                ] as const
                                            ).map((field) => {
                                                const labels: Record<string, string> = {
                                                    backstory: 'História do Personagem',
                                                    alliesAndOrgs:
                                                        'Aliados & Organizações',
                                                    treasure: 'Tesouro',
                                                };
                                                const val = isEditing
                                                    ? editHistorico[field]
                                                    : profile.characteristics?.[field] ??
                                                      '';
                                                if (!isEditing && !val) return null;
                                                return (
                                                    <div
                                                        key={field}
                                                        className="cdm-text-block"
                                                    >
                                                        <span className="font-XS-bold cdm-label">
                                                            {labels[field]}
                                                        </span>
                                                        {isEditing ? (
                                                            <textarea
                                                                className="cdm-edit-textarea font-XS-regular"
                                                                rows={4}
                                                                value={
                                                                    editHistorico[field]
                                                                }
                                                                onChange={(e) =>
                                                                    setEditHistorico(
                                                                        (p) => ({
                                                                            ...p,
                                                                            [field]:
                                                                                e.target
                                                                                    .value,
                                                                        })
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            <p className="font-XS-regular cdm-text-content cdm-text-scrollable">
                                                                {val}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}{' '}
                        {/* end principal tab */}
                        {/* ── Magias tab ──────────────────────────── */}
                        {activeTab === 'magias' && !isEditing && (
                            <div className="cdm-tab-content">
                                <div className="cs-spell-header">
                                    <div className="cs-spell-header-box">
                                        <input
                                            readOnly
                                            className="cs-field-input text-center cs-field-input--readonly bg-transparent"
                                            value={stats.spellCasting?.class ?? ''}
                                            placeholder="Classe"
                                        />
                                        <span className="cs-field-label">
                                            Classe de Magia
                                        </span>
                                    </div>
                                    <div className="cs-spell-header-box">
                                        <input
                                            readOnly
                                            className="cs-field-input text-center cs-field-input--readonly bg-transparent"
                                            value={stats.spellCasting?.ability ?? ''}
                                            placeholder="—"
                                        />
                                        <span className="cs-field-label">
                                            Habilidade-Chave de Magia
                                        </span>
                                    </div>
                                    <div className="cs-spell-header-box">
                                        <input
                                            readOnly
                                            className="cs-field-input text-center cs-field-input--readonly bg-transparent"
                                            value={stats.spellCasting?.saveDc ?? ''}
                                            placeholder="0"
                                        />
                                        <span className="cs-field-label">
                                            CD Resistência de Magia
                                        </span>
                                    </div>
                                    <div className="cs-spell-header-box">
                                        <input
                                            readOnly
                                            className="cs-field-input text-center cs-field-input--readonly bg-transparent"
                                            value={
                                                stats.spellCasting?.attackBonus != null
                                                    ? `+${stats.spellCasting.attackBonus}`
                                                    : ''
                                            }
                                            placeholder="+0"
                                        />
                                        <span className="cs-field-label">
                                            Bônus de Ataque com Magia
                                        </span>
                                    </div>
                                </div>
                                <div className="cs-spell-grid">
                                    {SPELL_LEVELS.map((sl) => {
                                        const spellsData =
                                            (char.data.spells as any) ?? {};
                                        const levelData =
                                            sl.level === 0
                                                ? {
                                                      spellIds: spellsData.cantrips ?? [],
                                                      slotsTotal: 0,
                                                      slotsExpended: 0,
                                                  }
                                                : spellsData[sl.level] ?? {
                                                      spellIds: [],
                                                      slotsTotal: 0,
                                                      slotsExpended: 0,
                                                  };
                                        const spellIds: string[] = Array.isArray(
                                            levelData.spellIds
                                        )
                                            ? levelData.spellIds
                                            : [];
                                        return (
                                            <div
                                                key={sl.level}
                                                className="cs-spell-level-box"
                                            >
                                                <div className="cs-spell-level-header">
                                                    <div className="cs-spell-level-badge">
                                                        {sl.level === 0 ? 'T' : sl.level}
                                                    </div>
                                                    {sl.slots && (
                                                        <div className="cs-spell-slots">
                                                            <span>Total</span>
                                                            <input
                                                                readOnly
                                                                value={
                                                                    levelData.slotsTotal ||
                                                                    ''
                                                                }
                                                                className="cs-spell-slot-input"
                                                                placeholder="0"
                                                            />
                                                            <span>Usados</span>
                                                            <input
                                                                readOnly
                                                                value={
                                                                    levelData.slotsExpended ||
                                                                    ''
                                                                }
                                                                className="cs-spell-slot-input"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="cs-spell-list">
                                                    {Array.from({
                                                        length: SPELLS_PER_LEVEL,
                                                    }).map((_, idx) => {
                                                        const spellId =
                                                            spellIds[idx] ?? '';
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className="cs-spell-row"
                                                            >
                                                                {sl.level > 0 && (
                                                                    <input
                                                                        type="checkbox"
                                                                        className="cs-spell-check"
                                                                        readOnly
                                                                        disabled
                                                                    />
                                                                )}
                                                                <input
                                                                    readOnly
                                                                    className="cs-spell-name-input"
                                                                    value={
                                                                        spellId
                                                                            ? spellNameMap[
                                                                                  spellId
                                                                              ] ?? spellId
                                                                            : ''
                                                                    }
                                                                    placeholder={
                                                                        sl.level === 0
                                                                            ? `Truque ${
                                                                                  idx + 1
                                                                              }`
                                                                            : `Magia ${
                                                                                  idx + 1
                                                                              }`
                                                                    }
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {isEditing &&
                            (() => {
                                const spellsData = (char.data.spells as any) ?? {};
                                const initSpellNames: Record<
                                    number,
                                    { name: string; spellId: string }[]
                                > = Object.fromEntries(
                                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => {
                                        const ids: string[] =
                                            l === 0
                                                ? Array.isArray(spellsData.cantrips)
                                                    ? spellsData.cantrips
                                                    : []
                                                : Array.isArray(spellsData[l]?.spellIds)
                                                ? spellsData[l].spellIds
                                                : [];
                                        return [
                                            l,
                                            Array.from({ length: 8 }).map((_, i) => {
                                                const id = ids[i] ?? '';
                                                return id
                                                    ? {
                                                          name: spellNameMap[id] ?? id,
                                                          spellId: id,
                                                      }
                                                    : { name: '', spellId: '' };
                                            }),
                                        ];
                                    })
                                );
                                const initSlotTotals: Record<number, number> =
                                    Object.fromEntries(
                                        [1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => [
                                            l,
                                            spellsData[l]?.slotsTotal ?? 0,
                                        ])
                                    );
                                const initSlotsExp: Record<number, number> =
                                    Object.fromEntries(
                                        [1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => [
                                            l,
                                            spellsData[l]?.slotsExpended ?? 0,
                                        ])
                                    );
                                return (
                                    <div
                                        className={
                                            activeTab !== 'magias'
                                                ? 'hidden'
                                                : 'cdm-tab-content'
                                        }
                                    >
                                        <SheetMagias
                                            ref={editMagiasRef}
                                            campaignId={campaignId}
                                            characterId={characterId}
                                            spellClassName={
                                                stats.spellCasting?.class ?? ''
                                            }
                                            spellAbilityLabel={
                                                stats.spellCasting?.ability ?? ''
                                            }
                                            spellCd={stats.spellCasting?.saveDc ?? 0}
                                            spellAttackBonus={
                                                stats.spellCasting?.attackBonus ?? 0
                                            }
                                            initialSpellNames={initSpellNames}
                                            initialSlotTotals={initSlotTotals}
                                            initialSlotsExpended={initSlotsExp}
                                        />
                                    </div>
                                );
                            })()}
                        {/* ── Habilidades tab ──────────────────────── */}
                        {activeTab === 'habilidades' && !isEditing && (
                            <div className="cdm-tab-content">
                                <div className="cs-spell-header">
                                    <div className="cs-spell-header-box">
                                        <input
                                            readOnly
                                            className="cs-field-input text-center cs-field-input--readonly bg-transparent"
                                            value={stats.spellCasting?.class ?? ''}
                                            placeholder="Classe"
                                        />
                                        <span className="cs-field-label">Classe</span>
                                    </div>
                                </div>
                                <div className="cs-spell-grid">
                                    {ABILITY_LEVELS.map((sl) => {
                                        const extraData =
                                            (char.data.extraAbilities as any) ?? {};
                                        const levelData =
                                            sl.level === 0
                                                ? {
                                                      abilities: extraData.cantrips ?? [],
                                                      slotsTotal: 0,
                                                      slotsExpended: 0,
                                                  }
                                                : extraData[sl.level] ?? {
                                                      slotsTotal: 0,
                                                      slotsExpended: 0,
                                                  };
                                        const abilities: string[] =
                                            sl.level === 0
                                                ? Array.isArray(levelData.abilities)
                                                    ? levelData.abilities
                                                    : []
                                                : Array.isArray(
                                                      levelData.extraAbilityNames
                                                  )
                                                ? levelData.extraAbilityNames
                                                : Array.isArray(levelData.extraAbilities)
                                                ? levelData.extraAbilities
                                                : [];
                                        return (
                                            <div
                                                key={sl.level}
                                                className="cs-spell-level-box"
                                            >
                                                <div className="cs-spell-level-header">
                                                    <div className="cs-spell-level-badge">
                                                        {sl.level === 0 ? 'T' : sl.level}
                                                    </div>
                                                    {sl.slots && (
                                                        <div className="cs-spell-slots">
                                                            <span>Total</span>
                                                            <input
                                                                readOnly
                                                                value={
                                                                    levelData.slotsTotal ||
                                                                    ''
                                                                }
                                                                className="cs-spell-slot-input"
                                                                placeholder="0"
                                                            />
                                                            <span>Usados</span>
                                                            <input
                                                                readOnly
                                                                value={
                                                                    levelData.slotsExpended ||
                                                                    ''
                                                                }
                                                                className="cs-spell-slot-input"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="cs-spell-list">
                                                    {Array.from({
                                                        length: ABILITIES_PER_LEVEL,
                                                    }).map((_, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="cs-spell-row"
                                                        >
                                                            {sl.level > 0 && (
                                                                <input
                                                                    type="checkbox"
                                                                    className="cs-spell-check"
                                                                    readOnly
                                                                    disabled
                                                                />
                                                            )}
                                                            <input
                                                                readOnly
                                                                className="cs-spell-name-input"
                                                                value={
                                                                    abilities[idx] ?? ''
                                                                }
                                                                placeholder={
                                                                    sl.level === 0
                                                                        ? `Truque ${
                                                                              idx + 1
                                                                          }`
                                                                        : `Habilidade ${
                                                                              idx + 1
                                                                          }`
                                                                }
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {isEditing &&
                            (() => {
                                const extraData = (char.data.extraAbilities as any) ?? {};
                                const initAbilityNames: Record<number, string[]> =
                                    Object.fromEntries(
                                        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => {
                                            const abilities: string[] =
                                                l === 0
                                                    ? Array.isArray(extraData.cantrips)
                                                        ? extraData.cantrips
                                                        : []
                                                    : Array.isArray(
                                                          extraData[l]?.extraAbilityNames
                                                      )
                                                    ? extraData[l].extraAbilityNames
                                                    : Array.isArray(
                                                          extraData[l]?.extraAbilities
                                                      )
                                                    ? extraData[l].extraAbilities
                                                    : [];
                                            return [
                                                l,
                                                Array.from({ length: 8 }).map(
                                                    (_, i) => abilities[i] ?? ''
                                                ),
                                            ];
                                        })
                                    );
                                const initSlotsTotal: Record<number, string> =
                                    Object.fromEntries(
                                        [1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => [
                                            l,
                                            String(extraData[l]?.slotsTotal ?? ''),
                                        ])
                                    );
                                const initSlotsExp: Record<number, number> =
                                    Object.fromEntries(
                                        [1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => [
                                            l,
                                            extraData[l]?.slotsExpended ?? 0,
                                        ])
                                    );
                                return (
                                    <div
                                        className={
                                            activeTab !== 'habilidades'
                                                ? 'hidden'
                                                : 'cdm-tab-content'
                                        }
                                    >
                                        <SheetHabilidades
                                            ref={editHabilidadesRef}
                                            campaignId={campaignId}
                                            characterId={characterId}
                                            spellClassName={
                                                stats.spellCasting?.class ?? ''
                                            }
                                            initialAbilityNames={initAbilityNames}
                                            initialSlotsTotal={initSlotsTotal}
                                            initialSlotsExpended={initSlotsExp}
                                        />
                                    </div>
                                );
                            })()}
                    </>
                )}
            </div>
        </div>
    );
}
