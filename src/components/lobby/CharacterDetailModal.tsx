'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import EditIcon from '@assets/icons/sys/edit.svg?url';
import ArrowBackIcon from '@assets/icons/nav/arrow-back.svg?url';
import ArrowRightIcon from '@assets/icons/nav/arrow-right.svg?url';
import LoadingDots from '@/components/common/LoadingDots';
import {
    getCharacterById,
    type FullCharacterDnd,
} from '@/server/characters/get-characters';
import {
    getDnd5eClassById,
    getDnd5eRaceById,
    getDnd5eSpellById,
    type DndClassRecord,
} from '@/server/dungeons&dragons5e/system';
import '@/components/lobby/styles/CharacterDetailModal.css';
import '@/app/campaigns/character-sheet/page.css';
import '@/components/profile/styles/ProfileActionModal.css';
import SheetMagias, {
    type SheetMagiasHandle,
} from '@/components/character-sheet/SheetMagias';
import SheetHabilidades, {
    type SheetHabilidadesHandle,
} from '@/components/character-sheet/SheetHabilidades';
import { deleteCharacter } from '@/server/characters/create-character';
import {
    updateCharacter,
    removeCharacterEquipment,
    updateCharacterMoney,
} from '@/server/characters/update-character';
import { uploadCharacterPicture } from '@/server/characters/upload-character-picture';
import XpIncreaseModal from '@/components/common/XpIncreaseModal';
import MoneyModal from '@/components/character-sheet/MoneyModal';
import ImageCropModal from '@/components/common/ImageCropModal';
import { applyXpGain } from '@/utils/characterXp';
import {
    buildLevelUpNotifications,
    getLevelingSnapshot,
    hasAnySpellProgression,
    type LevelUpNotification,
} from '@/utils/characterLeveling';
import type { ImageUploadIntent } from '@/utils/imageCrop';

interface CharacterDetailModalProps {
    characterId: string;
    campaignId?: string;
    isMaster?: boolean;
    xpSystem?: boolean;
    hideInventoryTab?: boolean;
    onBack: () => void;
    onDeleted?: () => void | Promise<void>;
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
    survival: 'Sobrevivíªncia',
    deception: 'Enganação',
    intimidation: 'Intimidação',
    performance: 'Atuação',
    persuasion: 'Persuasão',
};

// maps skill key â†’ ability key (str/dex/con/int/wis/cha)
const SKILL_TO_ABILITY: Record<string, string> = {
    acrobatics: 'dex',
    arcana: 'int',
    athletics: 'str',
    performance: 'cha',
    deception: 'cha',
    stealth: 'dex',
    history: 'int',
    intimidation: 'cha',
    insight: 'wis',
    investigation: 'int',
    animalHandling: 'wis',
    medicine: 'wis',
    nature: 'int',
    perception: 'wis',
    persuasion: 'cha',
    sleightOfHand: 'dex',
    religion: 'int',
    survival: 'wis',
};

const CURRENCY_LABELS: Record<'cp' | 'sp' | 'ep' | 'gp' | 'pp', string> = {
    cp: 'PC',
    sp: 'PP',
    ep: 'PE',
    gp: 'PO',
    pp: 'PL',
};

const MAGIC_CLASS_PT: Record<string, string> = {
    strength: 'Força',
    dexterity: 'Destreza',
    constitution: 'ConstituiíƒÂ§íƒÂ£o',
    intelligence: 'InteligíƒÂªncia',
    wisdom: 'Sabedoria',
    charisma: 'Carisma',
};

const ABILITY_KEY_MAP: Record<string, string> = {
    strength: 'str',
    dexterity: 'dex',
    constitution: 'con',
    intelligence: 'int',
    wisdom: 'wis',
    charisma: 'cha',
    forca: 'str',
    destreza: 'dex',
    constituicao: 'con',
    inteligencia: 'int',
    sabedoria: 'wis',
    carisma: 'cha',
};

function modifier(value: number): string {
    const mod = Math.floor((value - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

function signed(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
}

function normalizeAbilityName(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function getAbilityKeyFromLabel(value?: string | null): string {
    if (!value) return '';
    return ABILITY_KEY_MAP[normalizeAbilityName(value)] ?? '';
}

function getLocalizedAbilityLabel(value?: string | null): string {
    if (!value) return '';
    const normalized = normalizeAbilityName(value);
    return MAGIC_CLASS_PT[normalized] ?? value;
}

type CharacterOtherFields =
    FullCharacterDnd['data']['profile']['characteristics']['other'];

function getOtherProficiencies(other?: CharacterOtherFields | null): string {
    return other?.proficiencies ?? '';
}

function getOtherExtraCharacteristics(other?: CharacterOtherFields | null): string {
    return other?.extraCharacteristics ?? '';
}

function hasOtherSectionContent(other?: CharacterOtherFields | null): boolean {
    return Boolean(
        getOtherProficiencies(other) ||
            other?.characteristicsAndAbilities ||
            getOtherExtraCharacteristics(other)
    );
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
    campaignId = '',
    isMaster = false,
    xpSystem = true,
    hideInventoryTab = false,
    onBack,
    onDeleted,
}: CharacterDetailModalProps): JSX.Element {
    const [char, setChar] = useState<FullCharacterDnd | null>(null);
    const [loading, setLoading] = useState(true);
    const [classRecord, setClassRecord] = useState<DndClassRecord | null>(null);
    const [className, setClassName] = useState('');
    const [raceName, setRaceName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [xpModalOpen, setXpModalOpen] = useState(false);
    const [xpUpdateSaving, setXpUpdateSaving] = useState(false);
    const [xpUpdateError, setXpUpdateError] = useState('');
    const [levelUpNotifications, setLevelUpNotifications] = useState<
        LevelUpNotification[]
    >([]);
    const [activeNotificationIndex, setActiveNotificationIndex] = useState(0);
    const editMagiasRef = useRef<SheetMagiasHandle>(null);
    const editHabilidadesRef = useRef<SheetHabilidadesHandle>(null);
    const pictureInputRef = useRef<HTMLInputElement>(null);
    const [pendingImageCrop, setPendingImageCrop] = useState<{
        file: File;
        intent: ImageUploadIntent;
    } | null>(null);

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
    const [editBackground, setEditBackground] = useState('');
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
        description: '',
    });
    const [editEquipments, setEditEquipments] = useState('');
    const [editMoney, setEditMoney] = useState({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });
    const [editLevel, setEditLevel] = useState(1);
    const [moneyModalKey, setMoneyModalKey] = useState<
        'cp' | 'sp' | 'ep' | 'gp' | 'pp' | null
    >(null);
    const [moneyUpdating, setMoneyUpdating] = useState(false);
    const [editHistorico, setEditHistorico] = useState({
        backstory: '',
        alliesAndOrgs: '',
        treasure: '',
    });
    const [editOther, setEditOther] = useState({
        languagesAndProficiencies: '',
        characteristicsAndAbilities: '',
        characteristicsAndAdditionalAbilities: '',
    });
    const [editSkillProfs, setEditSkillProfs] = useState<Record<string, boolean>>({});
    const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(
        null
    );
    const [selling, setSelling] = useState(false);
    const [sellConfirmItem, setSellConfirmItem] = useState<{
        equipmentId: string;
        name: string;
        type: string;
        price: Array<number | string>;
        armorClass?: Array<number | string>;
        strength?: string;
        stealth?: string;
        weight: string;
        damage?: string;
        properties?: string;
    } | null>(null);
    const [activeTab, setActiveTab] = useState<
        'principal' | 'magias' | 'habilidades' | 'equipamentos'
    >('principal');
    const [spellNameMap, setSpellNameMap] = useState<Record<string, string>>({});
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        if (hideInventoryTab && activeTab === 'equipamentos') {
            setActiveTab('principal');
        }
    }, [activeTab, hideInventoryTab]);

    const loadSpellNameMap = async (
        targetCharacter: FullCharacterDnd | null
    ): Promise<Record<string, string>> => {
        const spellsData = (targetCharacter?.data?.spells as any) ?? null;
        if (!spellsData) return {};

        const ids: string[] = [];
        if (Array.isArray(spellsData.cantrips)) ids.push(...spellsData.cantrips);
        for (let level = 1; level <= 9; level++) {
            const levelData = spellsData[level];
            if (Array.isArray(levelData?.spellIds)) ids.push(...levelData.spellIds);
        }

        const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
        if (uniqueIds.length === 0) return {};

        const results = await Promise.all(uniqueIds.map((id) => getDnd5eSpellById(id)));
        const nextMap: Record<string, string> = {};
        results.forEach((result, index) => {
            if (result?.name) nextMap[uniqueIds[index]] = result.name;
        });
        return nextMap;
    };

    const loadCharacterModalData = async (): Promise<FullCharacterDnd | null> => {
        const result = await getCharacterById(characterId);
        setChar(result);

        if (result?.data?.profile) {
            const { class: classId, race: raceId } = result.data.profile;
            const [loadedClassRecord, raceData, nextSpellNameMap] = await Promise.all([
                classId ? getDnd5eClassById(classId) : Promise.resolve(null),
                raceId ? getDnd5eRaceById(raceId) : Promise.resolve(null),
                loadSpellNameMap(result),
            ]);

            setClassRecord(loadedClassRecord);
            setClassName(loadedClassRecord?.name ?? '');
            setRaceName(raceData?.name ?? '');
            setSpellNameMap(nextSpellNameMap);
            return result;
        }

        setClassRecord(null);
        setClassName('');
        setRaceName('');
        setSpellNameMap({});
        return result;
    };

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
        setEditBackground(profile.characteristics?.background ?? '');
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
            description: app?.description ?? '',
        });
        setEditEquipments(
            typeof char.data.inventory === 'string' ? char.data.inventory : ''
        );
        setEditMoney(char.data.money ?? { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });
        setEditLevel(Number(profile.level ?? 1));
        setEditHistorico({
            backstory: profile.characteristics?.backstory ?? '',
            alliesAndOrgs: profile.characteristics?.alliesAndOrgs ?? '',
            treasure: profile.characteristics?.treasure ?? '',
        });
        setEditOther({
            languagesAndProficiencies: getOtherProficiencies(
                profile.characteristics?.other
            ),
            characteristicsAndAbilities:
                profile.characteristics?.other?.characteristicsAndAbilities ?? '',
            characteristicsAndAdditionalAbilities: getOtherExtraCharacteristics(
                profile.characteristics?.other
            ),
        });
        // initialize per-skill proficiency from stored array
        const skillProfsInit: Record<string, boolean> = {};
        for (const sk of stats.skills ?? []) {
            skillProfsInit[sk.name] = sk.checked;
        }
        setEditSkillProfs(skillProfsInit);
        setSelectedInventoryItemId(null);
        setIsEditing(true);
    };

    const handleSell = async (item: {
        equipmentId: string;
        name: string;
        type: string;
        price: Array<number | string>;
        armorClass?: Array<number | string>;
        strength?: string;
        stealth?: string;
        weight: string;
        damage?: string;
        properties?: string;
    }) => {
        setSelling(true);
        const success = await removeCharacterEquipment(characterId, item.equipmentId);
        if (success) {
            await loadCharacterModalData();
        }
        setSelectedInventoryItemId(null);
        setSelling(false);
    };

    const handlePictureClick = () => {
        pictureInputRef.current?.click();
    };

    const handleDeleteCharacter = async () => {
        setDeleteSubmitting(true);
        setDeleteError('');

        const success = await deleteCharacter(characterId);

        if (!success) {
            setDeleteError('Nao foi possivel deletar o personagem agora.');
            setDeleteSubmitting(false);
            return;
        }

        setDeleteConfirmOpen(false);

        if (onDeleted) {
            await onDeleted();
        }

        setDeleteSubmitting(false);
        onBack();
    };

    const handleCharacterPictureUpload = async (file: File) => {
        const success = await uploadCharacterPicture(characterId, file);

        if (success) {
            await loadCharacterModalData();
            setPendingImageCrop(null);
            return;
        }

        throw new Error('Nao foi possivel atualizar a imagem do personagem.');
    };

    const handleXpIncrease = async (addedXp: number, hpGain: number) => {
        if (!char || !profile || !stats) return;

        if (!xpSystem) {
            setXpUpdateSaving(true);
            setXpUpdateError('');

            const success = await updateCharacter(characterId, {
                data: {
                    profile: {
                        xp: Number(profile.xp ?? 0) + addedXp,
                    },
                },
            });

            if (!success) {
                setXpUpdateSaving(false);
                setXpUpdateError('Falha ao atualizar XP.');
                return;
            }

            await loadCharacterModalData();
            setLevelUpNotifications([]);
            setActiveNotificationIndex(0);
            setXpUpdateSaving(false);
            setXpModalOpen(false);
            return;
        }

        const nextProgression = applyXpGain(profile?.xp ?? 0, addedXp);
        const currentLevel = Number(profile.level ?? 1);
        const nextLevel = Number(nextProgression.level ?? currentLevel);
        const levelsGained = Math.max(0, nextLevel - currentLevel);
        const nextProficiencyBonus = 2 + Math.floor((Math.max(1, nextLevel) - 1) / 4);
        const levelingSpecs = classRecord?.levelingSpecs;
        const nextHitPointTotal = Number(stats.hitPoints.points ?? 0) + hpGain;
        const nextLevelSnapshot =
            levelingSpecs && hasAnySpellProgression(levelingSpecs)
                ? getLevelingSnapshot(levelingSpecs, nextLevel)
                : null;
        const nextNotifications =
            nextLevel > currentLevel && levelingSpecs
                ? buildLevelUpNotifications(levelingSpecs, currentLevel, nextLevel)
                : [];

        const nextSkills = (stats.skills ?? [])
            .filter((skill) => skill.checked)
            .map((skill) => {
                const abilityKey = SKILL_TO_ABILITY[skill.name];
                const abilityScore =
                    stats.abilityScores.find((ability) => ability.ability === abilityKey)
                        ?.value ?? 10;
                const rawModifier = Math.floor((abilityScore - 10) / 2);
                return {
                    name: skill.name,
                    value: rawModifier + nextProficiencyBonus,
                    checked: true,
                };
            });

        const spellAbilitySource =
            classRecord?.magicClass ?? stats.spellCasting?.ability ?? '';
        const spellAbilityKey = getAbilityKeyFromLabel(spellAbilitySource);
        const spellAbilityScore =
            stats.abilityScores.find((ability) => ability.ability === spellAbilityKey)
                ?.value ?? 0;
        const spellAbilityModifier = Math.max(
            0,
            Math.floor((spellAbilityScore - 10) / 2)
        );
        const shouldPersistSpellcasting = Boolean(stats.spellCasting || spellAbilityKey);
        const nextSpellCasting = shouldPersistSpellcasting
            ? {
                  class: stats.spellCasting?.class ?? classRecord?.name ?? className,
                  ability:
                      stats.spellCasting?.ability ??
                      getLocalizedAbilityLabel(classRecord?.magicClass ?? ''),
                  saveDc: spellAbilityKey
                      ? 8 + nextProficiencyBonus + spellAbilityModifier
                      : 0,
                  attackBonus: spellAbilityKey
                      ? nextProficiencyBonus + spellAbilityModifier
                      : 0,
              }
            : undefined;

        const currentSpellsData = (char.data.spells as any) ?? {};
        const shouldPersistSpells = Boolean(nextLevelSnapshot);
        const nextSpellsPayload = shouldPersistSpells
            ? {
                  cantrips: Array.isArray(currentSpellsData.cantrips)
                      ? currentSpellsData.cantrips
                      : [],
                  ...Object.fromEntries(
                      Array.from({ length: 9 }, (_, index) => {
                          const spellLevel = index + 1;
                          const currentLevelData = currentSpellsData[spellLevel] ?? {};
                          const nextSlotsTotal =
                              nextLevelSnapshot?.slotTotals[spellLevel] ?? 0;
                          const currentSlotsExpended = Number(
                              currentLevelData?.slotsExpended ?? 0
                          );
                          return [
                              spellLevel,
                              {
                                  spellIds: Array.isArray(currentLevelData?.spellIds)
                                      ? currentLevelData.spellIds
                                      : [],
                                  slotsTotal: nextSlotsTotal,
                                  slotsExpended: Math.min(
                                      currentSlotsExpended,
                                      nextSlotsTotal
                                  ),
                              },
                          ];
                      })
                  ),
              }
            : undefined;

        setXpUpdateSaving(true);
        setXpUpdateError('');

        const success = await updateCharacter(characterId, {
            data: {
                profile: {
                    xp: nextProgression.xp,
                    level: nextProgression.level,
                },
                stats: {
                    abilityScores: stats.abilityScores,
                    skills: nextSkills,
                    proficiencyBonus: nextProficiencyBonus,
                    inspiration: stats.inspiration,
                    passiveWisdom: stats.passiveWisdom,
                    speed: stats.speed,
                    initiative: stats.initiative,
                    armorClass: stats.armorClass,
                    hitPoints: {
                        ...stats.hitPoints,
                        points: nextHitPointTotal,
                        currentPoints: nextHitPointTotal,
                    },
                    deathSaves: stats.deathSaves,
                    ...((nextSpellCasting || stats.spellCasting) && {
                        spellCasting: nextSpellCasting ?? stats.spellCasting,
                    }),
                },
                ...(nextSpellsPayload && { spells: nextSpellsPayload }),
            },
        });

        if (!success) {
            setXpUpdateSaving(false);
            setXpUpdateError('Falha ao atualizar XP.');
            return;
        }

        const updated = await loadCharacterModalData();
        if (updated) {
            setLevelUpNotifications(nextNotifications);
            setActiveNotificationIndex(0);
        }

        setXpUpdateSaving(false);
        setXpModalOpen(false);
    };

    const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingImageCrop({
            file,
            intent: 'character-portrait',
        });
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
                    ...(!xpSystem && isMaster && { level: editLevel }),
                    characteristics: {
                        background: editBackground,
                        personalityTraits: editPersonality.personalityTraits,
                        ideals: editPersonality.ideals,
                        bonds: editPersonality.bonds,
                        flaws: editPersonality.flaws,
                        appearance: editAppearance,
                        backstory: editHistorico.backstory,
                        alliesAndOrgs: editHistorico.alliesAndOrgs,
                        treasure: editHistorico.treasure,
                        other: {
                            proficiencies: editOther.languagesAndProficiencies,
                            characteristicsAndAbilities:
                                editOther.characteristicsAndAbilities,
                            extraCharacteristics:
                                editOther.characteristicsAndAdditionalAbilities,
                        },
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
                    skills: (() => {
                        const profBonus = char.data.stats.proficiencyBonus ?? 2;
                        return Object.entries(editSkillProfs)
                            .filter(([, checked]) => checked)
                            .map(([key]) => {
                                const abilityKey = SKILL_TO_ABILITY[key];
                                const abilityScore =
                                    editAbilityScores.find(
                                        (a) => a.ability === abilityKey
                                    )?.value ?? 10;
                                const rawMod = Math.floor((abilityScore - 10) / 2);
                                return {
                                    name: key,
                                    value: rawMod + profBonus,
                                    checked: true,
                                };
                            });
                    })(),
                },
                money: editMoney,
                inventory: editEquipments,
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
            payload as Record<string, any>
        );
        if (success) {
            await loadCharacterModalData();
            setIsEditing(false);
            setSelectedInventoryItemId(null);
        }
        setSaving(false);
    };

    useEffect(() => {
        setLoading(true);
        loadCharacterModalData().finally(() => setLoading(false));
        // We intentionally reload this modal only when the selected character changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [characterId]);

    useEffect(() => {
        if (xpSystem) return;
        setLevelUpNotifications([]);
        setActiveNotificationIndex(0);
    }, [xpSystem]);

    const profile = char?.data?.profile;
    const stats = char?.data?.stats;
    const appearance = profile?.characteristics?.appearance;
    const hasPersonalityInfo = Boolean(
        profile?.characteristics?.personalityTraits ||
            profile?.characteristics?.ideals ||
            profile?.characteristics?.bonds ||
            profile?.characteristics?.flaws
    );
    const picture =
        profile?.picture?.link ??
        appearance?.picture?.link ??
        char?.picture?.link ??
        '/images/SideImageBackground.svg';

    const loggedUserId =
        typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('userLogged') ?? 'null')?.userId
            : null;
    const isAuthor = !!loggedUserId && loggedUserId === char?.author?.userId;
    const canEdit = hideInventoryTab ? isAuthor : isAuthor || isMaster;
    const activeNotification = levelUpNotifications[activeNotificationIndex] ?? null;
    const canCloseNotifications =
        levelUpNotifications.length > 0 &&
        activeNotificationIndex === levelUpNotifications.length - 1;
    const inventoryText =
        typeof char?.data?.inventory === 'string' ? char.data.inventory : '';

    const inventoryItems: Array<{
        equipmentId: string;
        name: string;
        type: string;
        price: Array<number | string>;
        armorClass?: Array<number | string>;
        strength?: string;
        stealth?: string;
        weight: string;
        damage?: string;
        properties?: string;
    }> = Array.isArray(char?.data?.inventory)
        ? (char!.data.inventory as Array<{
              equipmentId: string;
              name: string;
              type: string;
              price: Array<number | string>;
              armorClass?: Array<number | string>;
              strength?: string;
              stealth?: string;
              weight: string;
              damage?: string;
              properties?: string;
          }>)
        : [];

    return (
        <>
            <div className="cdm-overlay">
                <div className="cdm-modal" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        className="cdm-back-btn font-XS-bold"
                        onClick={onBack}
                    >
                        ❮ Voltar
                    </button>

                    {loading && (
                        <span className="font-XS-regular cdm-loading">
                            <LoadingDots label="Carregando ficha" />
                        </span>
                    )}

                    {!loading && !char && (
                        <span className="font-XS-regular cdm-loading">
                            não foi possível carregar a ficha.
                        </span>
                    )}

                    {!loading && char && profile && stats && (
                        <>
                            {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                                                className={`button-L-fill font-XS-bold cdm-edit-btn text-color-primary/default_900${
                                                    hideInventoryTab
                                                        ? ' profile-action-modal-button-danger'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    hideInventoryTab && !isEditing
                                                        ? setDeleteConfirmOpen(true)
                                                        : isEditing
                                                        ? handleSave()
                                                        : handleStartEdit()
                                                }
                                                disabled={
                                                    saving ||
                                                    deleteSubmitting ||
                                                    (!isEditing &&
                                                        !hideInventoryTab &&
                                                        activeTab === 'equipamentos')
                                                }
                                            >
                                                {isEditing ? (
                                                    saving ? (
                                                        <LoadingDots label="Salvando ficha" />
                                                    ) : (
                                                        'Salvar Ficha'
                                                    )
                                                ) : hideInventoryTab ? (
                                                    'Deletar Personagem'
                                                ) : (
                                                    'Atualizar Ficha'
                                                )}
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
                                    {!xpSystem && isEditing && isMaster && (
                                        <div className="cdm-header-meta">
                                            <span className="font-XS-regular">
                                                <span className="cdm-label">Nível:</span>{' '}
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="cdm-edit-number w-20"
                                                    value={editLevel}
                                                    onChange={(e) =>
                                                        setEditLevel(
                                                            Math.max(
                                                                1,
                                                                Number(e.target.value) ||
                                                                    1
                                                            )
                                                        )
                                                    }
                                                />
                                            </span>
                                        </div>
                                    )}
                                    <div className="cdm-header-meta">
                                        <span className="font-XS-regular">
                                            <span className="cdm-label">Tendência:</span>{' '}
                                            {profile.characteristics?.alignment ?? '-'}
                                        </span>
                                        <span className="font-XS-regular">
                                            <span className="cdm-label">
                                                Antecedente:
                                            </span>{' '}
                                            {profile.characteristics?.background ?? '-'}
                                        </span>
                                        <span className="font-XS-regular">
                                            <span className="cdm-label">XP:</span>{' '}
                                            {profile.xp ?? 0}
                                        </span>
                                        <span className="font-XS-regular">
                                            <span className="cdm-label">Player:</span>{' '}
                                            {char.author?.nickname ?? '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* â”€â”€ Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                            {xpSystem && activeNotification && (
                                <div className="cdm-levelup-banner">
                                    <div className="cdm-levelup-copy">
                                        <span className="font-XXS-bold cdm-levelup-kicker">
                                            Nível {activeNotification.level}
                                        </span>
                                        <p className="font-XS-regular cdm-levelup-text">
                                            {activeNotification.message}
                                        </p>
                                    </div>
                                    <div className="cdm-levelup-actions">
                                        <span className="font-XXS-regular cdm-levelup-progress">
                                            {activeNotificationIndex + 1} /{' '}
                                            {levelUpNotifications.length}
                                        </span>
                                        <button
                                            type="button"
                                            className="cdm-levelup-nav"
                                            onClick={() =>
                                                setActiveNotificationIndex((current) =>
                                                    Math.max(0, current - 1)
                                                )
                                            }
                                            disabled={activeNotificationIndex === 0}
                                        >
                                            <Image
                                                src={ArrowBackIcon}
                                                alt="Anterior"
                                                width={18}
                                                height={18}
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            className="cdm-levelup-nav"
                                            onClick={() =>
                                                setActiveNotificationIndex((current) =>
                                                    Math.min(
                                                        levelUpNotifications.length - 1,
                                                        current + 1
                                                    )
                                                )
                                            }
                                            disabled={
                                                activeNotificationIndex ===
                                                levelUpNotifications.length - 1
                                            }
                                        >
                                            <Image
                                                src={ArrowRightIcon}
                                                alt="próxima"
                                                width={18}
                                                height={18}
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            className="cdm-levelup-close"
                                            onClick={() => {
                                                setLevelUpNotifications([]);
                                                setActiveNotificationIndex(0);
                                            }}
                                            disabled={!canCloseNotifications}
                                        >
                                            í—
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="cdm-tabs">
                                {(['principal', 'magias', 'habilidades'] as const).map(
                                    (tab) => (
                                        <button
                                            key={tab}
                                            type="button"
                                            className={`cdm-tab font-XS-bold${
                                                activeTab === tab
                                                    ? ' cdm-tab--active'
                                                    : ''
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
                                {!hideInventoryTab && (
                                    <button
                                        type="button"
                                        className={`cdm-tab font-XS-bold${
                                            activeTab === 'equipamentos'
                                                ? ' cdm-tab--active'
                                                : ''
                                        }`}
                                        disabled={isEditing || saving}
                                        onClick={() => setActiveTab('equipamentos')}
                                    >
                                        Equipamentos
                                    </button>
                                )}
                            </div>
                            {/* â”€â”€ Principal tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                            {activeTab === 'principal' && (
                                <>
                                    {/* â”€â”€ Atributos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                                    <div className="cdm-section">
                                        <div className="cdm-section-header">
                                            <h3 className="font-M-semibold cdm-section-title">
                                                Atributos
                                            </h3>
                                            {isMaster && (
                                                <button
                                                    type="button"
                                                    className="button-L-fill font-XS-bold bg-color-primary/default_900 text-color-greyScale/50"
                                                    onClick={() => {
                                                        setXpUpdateError('');
                                                        setXpModalOpen(true);
                                                    }}
                                                    disabled={xpUpdateSaving}
                                                >
                                                    {'Aumentar XP'}
                                                </button>
                                            )}
                                        </div>
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
                                                                setEditAbilityScores(
                                                                    (prev) =>
                                                                        prev.map(
                                                                            (a, i) =>
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

                                    {/* â”€â”€ Perícias â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                                    <div className="cdm-section">
                                        <h3 className="font-M-semibold cdm-section-title">
                                            Perícias
                                        </h3>
                                        <div className="cdm-info-grid">
                                            {(isEditing
                                                ? Object.keys(SKILL_LABELS)
                                                : (stats.skills ?? []).map(
                                                      (sk) => sk.name
                                                  )
                                            ).map((skillKey) => {
                                                const isProf = isEditing
                                                    ? !!editSkillProfs[skillKey]
                                                    : true;
                                                const bonus = isEditing
                                                    ? (() => {
                                                          const profBonus =
                                                              stats.proficiencyBonus ?? 2;
                                                          const abilityKey =
                                                              SKILL_TO_ABILITY[skillKey];
                                                          const abilityScore =
                                                              editAbilityScores.find(
                                                                  (a) =>
                                                                      a.ability ===
                                                                      abilityKey
                                                              )?.value ?? 10;
                                                          const rawMod = Math.floor(
                                                              (abilityScore - 10) / 2
                                                          );
                                                          return isProf
                                                              ? rawMod + profBonus
                                                              : rawMod;
                                                      })()
                                                    : (stats.skills ?? []).find(
                                                          (sk) => sk.name === skillKey
                                                      )?.value ?? 0;
                                                return (
                                                    <div
                                                        key={skillKey}
                                                        className="cdm-info-box"
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                        }}
                                                    >
                                                        {isEditing && (
                                                            <input
                                                                type="checkbox"
                                                                className="cs-save-check"
                                                                checked={isProf}
                                                                onChange={(e) =>
                                                                    setEditSkillProfs(
                                                                        (prev) => ({
                                                                            ...prev,
                                                                            [skillKey]:
                                                                                e.target
                                                                                    .checked,
                                                                        })
                                                                    )
                                                                }
                                                                style={{
                                                                    cursor: 'pointer',
                                                                }}
                                                            />
                                                        )}
                                                        <div style={{ flex: 1 }}>
                                                            <span className="font-XXS-regular cdm-info-label mr-2">
                                                                {SKILL_LABELS[skillKey] ||
                                                                    skillKey}
                                                            </span>
                                                            <span className="font-S-bold">
                                                                {signed(bonus)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* â”€â”€ Combate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                                                                speed: Number(
                                                                    e.target.value
                                                                ),
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
                                                    PV Max
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
                                                        value={
                                                            editCombat.hitPointsCurrent
                                                        }
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
                                                    Proficiíªncia
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

                                    {/* â”€â”€ Proficiências & Habilidades â”€â”€â”€ */}
                                    {(isEditing ||
                                        hasOtherSectionContent(
                                            profile.characteristics?.other
                                        ) ||
                                        Boolean(inventoryText)) && (
                                        <div className="cdm-section">
                                            <h3 className="font-M-semibold cdm-section-title">
                                                Proficiências &amp; Habilidades
                                            </h3>
                                            <div className="cdm-text-grid">
                                                {(
                                                    [
                                                        'languagesAndProficiencies',
                                                        'characteristicsAndAbilities',
                                                        'characteristicsAndAdditionalAbilities',
                                                    ] as const
                                                ).map((field) => {
                                                    const labels: Record<string, string> =
                                                        {
                                                            languagesAndProficiencies:
                                                                'Idiomas e Outras Proficiências',
                                                            characteristicsAndAbilities:
                                                                'Características e Habilidades',
                                                            characteristicsAndAdditionalAbilities:
                                                                'Características e Habilidades Adicionais',
                                                        };
                                                    const other =
                                                        profile.characteristics?.other;
                                                    const viewVals: Record<
                                                        typeof field,
                                                        string
                                                    > = {
                                                        languagesAndProficiencies:
                                                            getOtherProficiencies(other),
                                                        characteristicsAndAbilities:
                                                            other?.characteristicsAndAbilities ??
                                                            '',
                                                        characteristicsAndAdditionalAbilities:
                                                            getOtherExtraCharacteristics(
                                                                other
                                                            ),
                                                    };
                                                    const val = isEditing
                                                        ? editOther[field]
                                                        : viewVals[field];
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
                                                                        editOther[field]
                                                                    }
                                                                    onChange={(e) =>
                                                                        setEditOther(
                                                                            (prev) => ({
                                                                                ...prev,
                                                                                [field]:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                />
                                                            ) : (
                                                                <p className="font-XS-regular cdm-text-content cdm-text-scrollable">
                                                                    {val || '-'}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                <div className="cdm-text-block">
                                                    <span className="hidden">
                                                        {'Equipamentos'}
                                                    </span>
                                                    <span className="font-XS-bold cdm-label">
                                                        {'Invent\u00E1rio'}
                                                    </span>
                                                    {isEditing ? (
                                                        <textarea
                                                            className="cdm-edit-textarea font-XS-regular"
                                                            rows={4}
                                                            value={editEquipments}
                                                            onChange={(e) =>
                                                                setEditEquipments(
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <p className="font-XS-regular cdm-text-content cdm-text-scrollable">
                                                            {inventoryText || '\u2014'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* â”€â”€ Personalidade â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                                    {(isMaster || hasPersonalityInfo) && (
                                        <div className="cdm-section">
                                            <h3 className="font-M-semibold cdm-section-title">
                                                Personalidade
                                            </h3>
                                            {hasPersonalityInfo && (
                                                <div className="cdm-text-grid">
                                                    {profile.characteristics
                                                        ?.personalityTraits && (
                                                        <div className="cdm-text-block">
                                                            <span className="font-XS-bold cdm-label">
                                                                Traços de Personalidade
                                                            </span>
                                                            <p className="font-XS-regular cdm-text-content">
                                                                {
                                                                    profile
                                                                        .characteristics
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
                                                                {
                                                                    profile
                                                                        .characteristics
                                                                        .ideals
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                    {profile.characteristics?.bonds && (
                                                        <div className="cdm-text-block">
                                                            <span className="font-XS-bold cdm-label">
                                                                Vínculos
                                                            </span>
                                                            <p className="font-XS-regular cdm-text-content">
                                                                {
                                                                    profile
                                                                        .characteristics
                                                                        .bonds
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                    {profile.characteristics?.flaws && (
                                                        <div className="cdm-text-block">
                                                            <span className="font-XS-bold cdm-label">
                                                                Falhas
                                                            </span>
                                                            <p className="font-XS-regular cdm-text-content">
                                                                {
                                                                    profile
                                                                        .characteristics
                                                                        .flaws
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* â”€â”€ Aparência â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                                                    const labels: Record<string, string> =
                                                        {
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
                                                    if (!isEditing && !rawVal)
                                                        return null;
                                                    const display =
                                                        !isEditing && field === 'height'
                                                            ? `${Number(rawVal) / 100} m`
                                                            : !isEditing &&
                                                              field === 'weight'
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
                                                                        editAppearance[
                                                                            field
                                                                        ]
                                                                    }
                                                                    onChange={(e) =>
                                                                        setEditAppearance(
                                                                            (p) => ({
                                                                                ...p,
                                                                                [field]:
                                                                                    e
                                                                                        .target
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
                                            {(isEditing || appearance?.description) && (
                                                <div className="cdm-text-block">
                                                    <span className="font-XS-bold cdm-label">
                                                        Aparência do Personagem
                                                    </span>
                                                    {isEditing ? (
                                                        <textarea
                                                            className="cdm-edit-textarea font-XS-regular"
                                                            rows={4}
                                                            value={
                                                                editAppearance.description
                                                            }
                                                            onChange={(e) =>
                                                                setEditAppearance(
                                                                    (p) => ({
                                                                        ...p,
                                                                        description:
                                                                            e.target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <p className="font-XS-regular cdm-text-content">
                                                            {appearance?.description}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* â”€â”€ Ataques â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                                                    <div
                                                        key={i}
                                                        className="cdm-attacks-row"
                                                    >
                                                        <span className="font-XS-regular">
                                                            {atk.name || '-'}
                                                        </span>
                                                        <span className="font-XS-regular">
                                                            {atk.atkBonus || '-'}
                                                        </span>
                                                        <span className="font-XS-regular">
                                                            {atk.damage || '-'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* â”€â”€ Histórico â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                                                    const labels: Record<string, string> =
                                                        {
                                                            backstory:
                                                                'História do Personagem',
                                                            alliesAndOrgs:
                                                                'Aliados & Organizações',
                                                            treasure: 'Tesouro',
                                                        };
                                                    const val = isEditing
                                                        ? editHistorico[field]
                                                        : profile.characteristics?.[
                                                              field
                                                          ] ?? '';
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
                                                                        editHistorico[
                                                                            field
                                                                        ]
                                                                    }
                                                                    onChange={(e) =>
                                                                        setEditHistorico(
                                                                            (p) => ({
                                                                                ...p,
                                                                                [field]:
                                                                                    e
                                                                                        .target
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
                            {/* â”€â”€ Equipamentos tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                            {!hideInventoryTab && activeTab === 'equipamentos' && (
                                <div className="cdm-tab-content">
                                    <div className="cdm-section">
                                        <h3 className="font-M-semibold cdm-section-title">
                                            Equipamentos
                                        </h3>
                                        <div className="hidden">
                                            <span className="font-XS-bold cdm-label">
                                                Equipamentos
                                            </span>
                                            {inventoryText && (
                                                <p className="font-XS-regular cdm-text-content">
                                                    {inventoryText}
                                                </p>
                                            )}
                                        </div>
                                        {inventoryItems.length > 0 && (
                                            <div className="cdm-inventory-wrapper">
                                                <span className="font-XS-bold cdm-label">
                                                    Equipamentos
                                                </span>
                                                <div className="cdm-inventory-table-wrapper">
                                                    <table className="cdm-inventory-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Nome</th>
                                                                <th>Tipo</th>
                                                                <th>CA</th>
                                                                <th>Peso</th>
                                                                <th>Dano</th>
                                                                <th>Propriedades</th>
                                                                <th />
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {inventoryItems.map(
                                                                (item) => {
                                                                    const isSelected =
                                                                        selectedInventoryItemId ===
                                                                        item.equipmentId;
                                                                    return (
                                                                        <tr
                                                                            key={
                                                                                item.equipmentId
                                                                            }
                                                                            className={
                                                                                isSelected
                                                                                    ? 'cdm-inventory-row--selected'
                                                                                    : 'cdm-inventory-row--clickable'
                                                                            }
                                                                            onClick={() =>
                                                                                setSelectedInventoryItemId(
                                                                                    isSelected
                                                                                        ? null
                                                                                        : item.equipmentId
                                                                                )
                                                                            }
                                                                        >
                                                                            <td className="font-semibold">
                                                                                {
                                                                                    item.name
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {item.type ||
                                                                                    '-'}
                                                                            </td>
                                                                            <td>
                                                                                {item.armorClass?.join(
                                                                                    ' '
                                                                                ) || '-'}
                                                                            </td>
                                                                            <td>
                                                                                {item.weight ||
                                                                                    '-'}
                                                                            </td>
                                                                            <td>
                                                                                {item.damage ||
                                                                                    '-'}
                                                                            </td>
                                                                            <td>
                                                                                {item.properties ||
                                                                                    '-'}
                                                                            </td>
                                                                            <td>
                                                                                {isSelected && (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="cdm-sell-btn"
                                                                                        disabled={
                                                                                            selling
                                                                                        }
                                                                                        onClick={(
                                                                                            e
                                                                                        ) => {
                                                                                            e.stopPropagation();
                                                                                            setSellConfirmItem(
                                                                                                item
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        {selling
                                                                                            ? '...'
                                                                                            : 'Vender'}
                                                                                    </button>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                }
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                        {inventoryItems.length === 0 && (
                                            <div className="cdm-text-block">
                                                <p className="font-XS-regular cdm-text-content">
                                                    Nenhum equipamento comprado.
                                                </p>
                                            </div>
                                        )}
                                        <div className="cdm-money-grid">
                                            {(
                                                ['cp', 'sp', 'ep', 'gp', 'pp'] as const
                                            ).map((coin) => (
                                                <button
                                                    key={coin}
                                                    type="button"
                                                    className="cdm-info-box cursor-pointer"
                                                    disabled={moneyUpdating}
                                                    onClick={() => setMoneyModalKey(coin)}
                                                >
                                                    <span className="font-XXS-regular cdm-info-label">
                                                        {CURRENCY_LABELS[coin]}
                                                    </span>
                                                    <span className="font-S-bold">
                                                        {char.data.money?.[coin] ?? 0}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* â”€â”€ Magias tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                                                placeholder="-"
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
                                                CD Resistíªncia de Magia
                                            </span>
                                        </div>
                                        <div className="cs-spell-header-box">
                                            <input
                                                readOnly
                                                className="cs-field-input text-center cs-field-input--readonly bg-transparent"
                                                value={
                                                    stats.spellCasting?.attackBonus !=
                                                    null
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
                                                          spellIds:
                                                              spellsData.cantrips ?? [],
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
                                                            {sl.level === 0
                                                                ? 'T'
                                                                : sl.level}
                                                        </div>
                                                        {sl.slots && (
                                                            <div className="cs-spell-slots">
                                                                <span>
                                                                    Espaços de Magia:{' '}
                                                                    {levelData.slotsTotal ||
                                                                        0}
                                                                </span>
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
                                                                    <input
                                                                        readOnly
                                                                        className="cs-spell-name-input"
                                                                        value={
                                                                            spellId
                                                                                ? spellNameMap[
                                                                                      spellId
                                                                                  ] ??
                                                                                  spellId
                                                                                : ''
                                                                        }
                                                                        placeholder={
                                                                            sl.level === 0
                                                                                ? `Truque ${
                                                                                      idx +
                                                                                      1
                                                                                  }`
                                                                                : `Magia ${
                                                                                      idx +
                                                                                      1
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
                                                    : Array.isArray(
                                                          spellsData[l]?.spellIds
                                                      )
                                                    ? spellsData[l].spellIds
                                                    : [];
                                            return [
                                                l,
                                                Array.from({ length: 8 }).map((_, i) => {
                                                    const id = ids[i] ?? '';
                                                    return id
                                                        ? {
                                                              name:
                                                                  spellNameMap[id] ?? id,
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
                                                levelingSpecs={classRecord?.levelingSpecs}
                                                currentLevel={profile.level}
                                            />
                                        </div>
                                    );
                                })()}
                            {/* â”€â”€ Habilidades tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                                                          abilities:
                                                              extraData.cantrips ?? [],
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
                                                    : Array.isArray(
                                                          levelData.extraAbilities
                                                      )
                                                    ? levelData.extraAbilities
                                                    : [];
                                            return (
                                                <div
                                                    key={sl.level}
                                                    className="cs-spell-level-box"
                                                >
                                                    <div className="cs-spell-level-header">
                                                        <div className="cs-spell-level-badge">
                                                            {sl.level === 0
                                                                ? 'T'
                                                                : sl.level}
                                                        </div>
                                                        {sl.slots && (
                                                            <div className="cs-spell-slots">
                                                                <span>
                                                                    Espaços de Magia:{' '}
                                                                    {levelData.slotsTotal ||
                                                                        0}
                                                                </span>
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
                                                                <input
                                                                    readOnly
                                                                    className="cs-spell-name-input"
                                                                    value={
                                                                        abilities[idx] ??
                                                                        ''
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
                                    const extraData =
                                        (char.data.extraAbilities as any) ?? {};
                                    const initAbilityNames: Record<number, string[]> =
                                        Object.fromEntries(
                                            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => {
                                                const abilities: string[] =
                                                    l === 0
                                                        ? Array.isArray(
                                                              extraData.cantrips
                                                          )
                                                            ? extraData.cantrips
                                                            : []
                                                        : Array.isArray(
                                                              extraData[l]
                                                                  ?.extraAbilityNames
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

            {sellConfirmItem !== null &&
                (() => {
                    const rawAmount = Number(sellConfirmItem.price[0]);
                    const unit = String(sellConfirmItem.price[1] ?? '');
                    const sellAmount = Math.floor(rawAmount * 0.9);
                    return (
                        <div
                            className="cdm-overlay"
                            onClick={() => setSellConfirmItem(null)}
                        >
                            <div
                                className="cdm-sell-confirm-modal"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="font-M-semibold cdm-sell-confirm-title">
                                    Confirmar Venda
                                </h3>
                                <p className="font-XS-regular cdm-sell-confirm-body">
                                    Vender{' '}
                                    <span className="font-XS-bold">
                                        {sellConfirmItem.name}
                                    </span>{' '}
                                    por{' '}
                                    <span className="font-XS-bold">
                                        {sellAmount} {unit}
                                    </span>{' '}
                                    (âˆ’10%)
                                </p>
                                <div className="cdm-sell-confirm-actions">
                                    <button
                                        type="button"
                                        className="cdm-sell-confirm-cancel"
                                        onClick={() => setSellConfirmItem(null)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="cdm-sell-confirm-ok"
                                        disabled={selling}
                                        onClick={async () => {
                                            const item = sellConfirmItem;
                                            setSellConfirmItem(null);
                                            await handleSell(item);
                                        }}
                                    >
                                        {selling ? '...' : 'Confirmar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

            {deleteConfirmOpen && (
                <div
                    className="cdm-overlay"
                    onClick={() => {
                        if (deleteSubmitting) return;
                        setDeleteConfirmOpen(false);
                        setDeleteError('');
                    }}
                >
                    <div
                        className="profile-action-modal-card"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h1 className="profile-action-modal-title font-L-semibold">
                            Deletar personagem
                        </h1>
                        <p className="profile-action-modal-description font-XS-regular">
                            Tem certeza que deseja deletar este personagem? Esta acao nao
                            pode ser desfeita.
                        </p>

                        <div className="profile-action-modal-buttons">
                            <button
                                type="button"
                                disabled={deleteSubmitting}
                                onClick={() => {
                                    void handleDeleteCharacter();
                                }}
                                className="font-S-bold button-L-fill bg-color-primary/default_900 profile-action-modal-button-danger w-full"
                            >
                                {deleteSubmitting ? (
                                    <LoadingDots label="Excluindo personagem" />
                                ) : (
                                    'Confirmar'
                                )}
                            </button>
                            {deleteError ? (
                                <span className="font-XXS-regular profile-action-modal-error">
                                    {deleteError}
                                </span>
                            ) : null}
                            <button
                                type="button"
                                onClick={() => {
                                    setDeleteConfirmOpen(false);
                                    setDeleteError('');
                                }}
                                disabled={deleteSubmitting}
                                className="font-S-bold form-button-cancel button-L-fill w-full"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {moneyModalKey !== null && char && (
                <MoneyModal
                    currencyLabel={CURRENCY_LABELS[moneyModalKey]}
                    currentAmount={char.data.money?.[moneyModalKey] ?? 0}
                    onConfirm={async (delta) => {
                        const key = moneyModalKey;
                        setMoneyModalKey(null);
                        setMoneyUpdating(true);
                        await updateCharacterMoney(characterId, {
                            operation: delta > 0 ? 'add' : 'subtract',
                            money: Math.abs(delta),
                            moneyType: CURRENCY_LABELS[key],
                        });
                        await loadCharacterModalData();
                        setMoneyUpdating(false);
                    }}
                    onClose={() => setMoneyModalKey(null)}
                />
            )}

            {xpModalOpen && profile && (
                <XpIncreaseModal
                    currentXp={profile.xp ?? 0}
                    submitting={xpUpdateSaving}
                    errorMessage={xpUpdateError}
                    xpSystemEnabled={xpSystem}
                    hitDice={
                        (classRecord?.hitPoints?.hitDice as unknown as string) ??
                        stats?.hitPoints?.dicePoints ??
                        ''
                    }
                    constitutionModifier={Math.floor(
                        ((stats?.abilityScores?.find((a) => a.ability === 'con')?.value ??
                            10) -
                            10) /
                            2
                    )}
                    currentLevel={Number(profile.level ?? 1)}
                    onClose={() => {
                        if (xpUpdateSaving) return;
                        setXpUpdateError('');
                        setXpModalOpen(false);
                    }}
                    onConfirm={handleXpIncrease}
                />
            )}

            {pendingImageCrop ? (
                <ImageCropModal
                    file={pendingImageCrop.file}
                    intent={pendingImageCrop.intent}
                    onConfirm={handleCharacterPictureUpload}
                    onUseOriginal={handleCharacterPictureUpload}
                    onClose={() => setPendingImageCrop(null)}
                />
            ) : null}
        </>
    );
}
