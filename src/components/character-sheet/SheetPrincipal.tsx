'use client';
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    getDnd5eClasses,
    getDnd5eRaces,
    getDnd5eRaceById,
    getDnd5eClassById,
} from '@/server/dungeons&dragons5e/system';
import GenerateScoresModal from '@/components/character-sheet/GenerateScoresModal';
import XpIncreaseModal from '@/components/common/XpIncreaseModal';
import { applyXpGain } from '@/utils/characterXp';
import { type LevelingSpecs } from '@/utils/characterLeveling';
import { generateAbilityScores, rollStartingWealth } from '@/utils/rollAbilityScore';
import MoneyModal from '@/components/character-sheet/MoneyModal';

const ABILITIES = [
    { key: 'str', label: 'Força' },
    { key: 'dex', label: 'Destreza' },
    { key: 'con', label: 'Constituição' },
    { key: 'int', label: 'Inteligência' },
    { key: 'wis', label: 'Sabedoria' },
    { key: 'cha', label: 'Carisma' },
] as const;

type AbilityKey = (typeof ABILITIES)[number]['key'];

const EMPTY_ABILITY_SCORES: Record<AbilityKey, number> = {
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
    cha: 0,
};

const GENERATED_SCORES_INFO_MESSAGE =
    'Caso hajam valores adicionais para distribuir, como de caracteristicas ou sub raças, os anote e distribua na edição de personagem, depois de criar a ficha.';

const SAVES = [
    { key: 'str', label: 'Força' },
    { key: 'dex', label: 'Destreza' },
    { key: 'con', label: 'Constituição' },
    { key: 'int', label: 'Inteligência' },
    { key: 'wis', label: 'Sabedoria' },
    { key: 'cha', label: 'Carisma' },
] as const;

const SKILLS = [
    { key: 'acrobatics', label: 'Acrobacia', ability: 'Des' },
    { key: 'arcana', label: 'Arcanismo', ability: 'Int' },
    { key: 'athletics', label: 'Atletismo', ability: 'For' },
    { key: 'performance', label: 'Atuação', ability: 'Car' },
    { key: 'deception', label: 'Blefar', ability: 'Car' },
    { key: 'stealth', label: 'Furtividade', ability: 'Des' },
    { key: 'history', label: 'História', ability: 'Int' },
    { key: 'intimidation', label: 'Intimidação', ability: 'Car' },
    { key: 'insight', label: 'Intuição', ability: 'Sab' },
    { key: 'investigation', label: 'Investigação', ability: 'Int' },
    { key: 'animalHandling', label: 'Lidar com Animais', ability: 'Sab' },
    { key: 'medicine', label: 'Medicina', ability: 'Sab' },
    { key: 'nature', label: 'Natureza', ability: 'Int' },
    { key: 'perception', label: 'Percepção', ability: 'Sab' },
    { key: 'persuasion', label: 'Persuasão', ability: 'Car' },
    { key: 'sleightOfHand', label: 'Prestidigitação', ability: 'Des' },
    { key: 'religion', label: 'Religião', ability: 'Int' },
    { key: 'survival', label: 'Sobrevivência', ability: 'Sab' },
] as const;

const CURRENCY_LABELS: Record<'cp' | 'sp' | 'ep' | 'gp' | 'pp', string> = {
    cp: 'PC',
    sp: 'PP',
    ep: 'PE',
    gp: 'PO',
    pp: 'PL',
};

export interface SheetPrincipalHandle {
    getData: () => {
        characterName: string;
        selectedClassId: string;
        selectedRaceId: string;
        alignment: string;
        background: string;
        personalityTraits: string;
        ideals: string;
        bonds: string;
        flaws: string;
        abilityScores: Record<string, number>;
        saveProfs: Record<string, boolean>;
        skills: { name: string; value: number; checked: boolean }[];
        hpTotal: number;
        currentHp: number;
        tempHp: number;
        hitDice: string;
        raceSpeed: number;
        inspiration: number;
        deathSaves: { success: number; failures: number };
        attacks: { name: string; atkBonus: string; damageRaw: string }[];
        money: { cp: number; sp: number; ep: number; gp: number; pp: number };
        proficienciesText: string;
        extraCharacteristics: string;
        inventory: string;
        passiveWisdom: number;
        xp: number;
        level: number;
    };
}

interface SheetPrincipalProps {
    campaignId: string;
    characterId: string;
    isMaster: boolean;
    xpSystem: boolean;
    onSpellDataChange?: (data: {
        spellClassName: string;
        spellAbilityLabel: string;
        spellCd: number;
        spellAttackBonus: number;
        levelingSpecs?: LevelingSpecs;
    }) => void;
}

const SheetPrincipal = forwardRef<SheetPrincipalHandle, SheetPrincipalProps>(
    function SheetPrincipal(
        { campaignId, characterId, isMaster, xpSystem, onSpellDataChange },
        ref
    ) {
        const [classes, setClasses] = useState<{ classId: string; name: string }[]>([]);
        const [selectedClassId, setSelectedClassId] = useState('');
        const [classBaseHp, setClassBaseHp] = useState(0);
        const [hitDice, setHitDice] = useState('');
        const [hpTotal, setHpTotal] = useState(0);
        const [spellAbilityLabel, setSpellAbilityLabel] = useState('');
        const [spellAbilityKey, setSpellAbilityKey] = useState('');
        const [classLevelingSpecs, setClassLevelingSpecs] =
            useState<LevelingSpecs | null>(null);
        const [races, setRaces] = useState<{ raceId: string; name: string }[]>([]);
        const [selectedRaceId, setSelectedRaceId] = useState('');
        const [raceSpeed, setRaceSpeed] = useState(0);
        const [raceBonusApplied, setRaceBonusApplied] = useState(false);
        const [showGenerateModal, setShowGenerateModal] = useState(false);
        const [skillProfs, setSkillProfs] = useState<Record<string, boolean>>({});
        const [saveProfs, setSaveProfs] = useState<Record<string, boolean>>({});
        const [baseAbilityScores, setBaseAbilityScores] =
            useState<Record<AbilityKey, number>>(EMPTY_ABILITY_SCORES);
        const [raceAbilityBonuses, setRaceAbilityBonuses] =
            useState<Record<AbilityKey, number>>(EMPTY_ABILITY_SCORES);
        const [generatedScores, setGeneratedScores] = useState<number[]>([]);
        const [usedGeneratedScoreIndexes, setUsedGeneratedScoreIndexes] = useState<
            boolean[]
        >([]);
        const [assignedGeneratedScoresByAbility, setAssignedGeneratedScoresByAbility] =
            useState<Partial<Record<AbilityKey, boolean>>>({});
        const [selectedAbilityKey, setSelectedAbilityKey] = useState<AbilityKey | null>(
            null
        );
        const [characterName, setCharacterName] = useState('');
        const [alignment, setAlignment] = useState('');
        const [background, setBackground] = useState('');
        const [personalityTraits, setPersonalityTraits] = useState('');
        const [ideals, setIdeals] = useState('');
        const [bonds, setBonds] = useState('');
        const [flaws, setFlaws] = useState('');
        const [currentHp, setCurrentHp] = useState(0);
        const [tempHp, setTempHp] = useState(0);
        const [inspiration, setInspiration] = useState(0);
        const [deathSaves, setDeathSaves] = useState({ success: 0, failures: 0 });
        const [attacks, setAttacks] = useState([
            { name: '', atkBonus: '', damageRaw: '' },
            { name: '', atkBonus: '', damageRaw: '' },
            { name: '', atkBonus: '', damageRaw: '' },
        ]);
        const [money, setMoney] = useState({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });
        const [moneyModalKey, setMoneyModalKey] = useState<
            'cp' | 'sp' | 'ep' | 'gp' | 'pp' | null
        >(null);
        const [proficienciesText, setProficienciesText] = useState('');
        const [extraCharacteristics, setExtraCharacteristics] = useState('');
        const [inventory, setInventory] = useState('');
        const [xp, setXp] = useState(0);
        const [level, setLevel] = useState(1);
        const [xpModalOpen, setXpModalOpen] = useState(false);
        const abilityScores = useMemo<Record<AbilityKey, number>>(
            () => ({
                str: baseAbilityScores.str + raceAbilityBonuses.str,
                dex: baseAbilityScores.dex + raceAbilityBonuses.dex,
                con: baseAbilityScores.con + raceAbilityBonuses.con,
                int: baseAbilityScores.int + raceAbilityBonuses.int,
                wis: baseAbilityScores.wis + raceAbilityBonuses.wis,
                cha: baseAbilityScores.cha + raceAbilityBonuses.cha,
            }),
            [baseAbilityScores, raceAbilityBonuses]
        );

        useImperativeHandle(ref, () => ({
            getData: () => {
                const numMod = (score: number) =>
                    Math.max(0, Math.floor((score - 10) / 2));
                const SKILL_AB: Record<string, string> = {
                    Des: 'dex',
                    Int: 'int',
                    For: 'str',
                    Car: 'cha',
                    Sab: 'wis',
                    Con: 'con',
                };
                const skills = SKILLS.filter((sk) => skillProfs[sk.key]).map((sk) => {
                    const ab = SKILL_AB[sk.ability] as keyof typeof abilityScores;
                    const mod = numMod(abilityScores[ab]);
                    return { name: sk.key, value: mod + 2, checked: true };
                });
                return {
                    characterName,
                    selectedClassId,
                    selectedRaceId,
                    alignment,
                    background,
                    personalityTraits,
                    ideals,
                    bonds,
                    flaws,
                    abilityScores: Object.fromEntries(
                        Object.entries(abilityScores).map(([k, v]) => [k, Number(v)])
                    ) as Record<string, number>,
                    saveProfs,
                    skills,
                    hpTotal: Number(hpTotal),
                    currentHp: Number(currentHp),
                    tempHp: Number(tempHp),
                    hitDice,
                    raceSpeed: Number(raceSpeed),
                    inspiration: Number(inspiration),
                    deathSaves: {
                        success: Number(deathSaves.success),
                        failures: Number(deathSaves.failures),
                    },
                    attacks,
                    money: {
                        cp: Number(money.cp),
                        sp: Number(money.sp),
                        ep: Number(money.ep),
                        gp: Number(money.gp),
                        pp: Number(money.pp),
                    },
                    proficienciesText,
                    extraCharacteristics,
                    inventory,
                    passiveWisdom: Number(passiveWisdom),
                    xp: Number(xp),
                    level: Number(level),
                };
            },
        }));

        const calcMod = (score: number): string => {
            if (score === 0) return '+0';
            const m = Math.floor((score - 10) / 2);
            return m > 0 ? `+${m}` : '+0';
        };

        const numericMod = (score: number): number =>
            Math.max(0, Math.floor((score - 10) / 2));

        const passiveWisdom =
            10 + numericMod(abilityScores.wis) + (skillProfs['perception'] ? 2 : 0);

        const calcBonus = (score: number): string => {
            const m = Math.floor((score - 10) / 2);
            const total = m + 2;
            return total > 0 ? `+${total}` : '+0';
        };

        const SKILL_ABILITY_MAP: Record<string, keyof typeof abilityScores> = {
            Des: 'dex',
            Int: 'int',
            For: 'str',
            Car: 'cha',
            Sab: 'wis',
            Con: 'con',
        };

        const normalizeAbilityName = (value: string): string =>
            value
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');

        const ABILITY_KEY_MAP: Record<string, string> = {
            strength: 'str',
            dexterity: 'dex',
            constitution: 'con',
            intelligence: 'int',
            wisdom: 'wis',
            charisma: 'cha',
            forca: 'str',
            constituicao: 'con',
            inteligencia: 'int',
            força: 'str',
            destreza: 'dex',
            constituição: 'con',
            inteligência: 'int',
            sabedoria: 'wis',
            carisma: 'cha',
        };

        const resetGeneratedScoreState = () => {
            setGeneratedScores([]);
            setUsedGeneratedScoreIndexes([]);
            setAssignedGeneratedScoresByAbility({});
            setBaseAbilityScores({ ...EMPTY_ABILITY_SCORES });
            setRaceAbilityBonuses({ ...EMPTY_ABILITY_SCORES });
            setRaceBonusApplied(false);
            setSelectedAbilityKey(null);
            setShowGenerateModal(false);
        };

        const handleGenerateAbilityScores = () => {
            const nextScores = generateAbilityScores();
            setGeneratedScores(nextScores);
            setUsedGeneratedScoreIndexes(
                Array.from({ length: nextScores.length }, () => false)
            );
            setAssignedGeneratedScoresByAbility({});
            setBaseAbilityScores({ ...EMPTY_ABILITY_SCORES });
            setRaceAbilityBonuses({ ...EMPTY_ABILITY_SCORES });
            setRaceBonusApplied(false);
            setSelectedAbilityKey(null);
            setShowGenerateModal(true);
        };

        const handleOpenAbilityScorePicker = (abilityKey: AbilityKey) => {
            if (!generatedScores.length) return;
            if (assignedGeneratedScoresByAbility[abilityKey]) return;
            setSelectedAbilityKey(abilityKey);
            setShowGenerateModal(true);
        };

        const availableGeneratedScoreIndexes = generatedScores.map(
            (_, index) => !usedGeneratedScoreIndexes[index]
        );

        const handleSelectGeneratedScore = (scoreIndex: number) => {
            if (!selectedAbilityKey) return;
            if (!availableGeneratedScoreIndexes[scoreIndex]) return;

            setUsedGeneratedScoreIndexes((prev) =>
                prev.map((used, index) => (index === scoreIndex ? true : used))
            );
            setAssignedGeneratedScoresByAbility((prev) => ({
                ...prev,
                [selectedAbilityKey]: true,
            }));
            setBaseAbilityScores((prev) => ({
                ...prev,
                [selectedAbilityKey]: generatedScores[scoreIndex] ?? 0,
            }));
            setSelectedAbilityKey(null);
            setShowGenerateModal(false);
        };

        const handleCloseGenerateModal = () => {
            setSelectedAbilityKey(null);
            setShowGenerateModal(false);
        };

        const handleSelectClass = async (classId: string) => {
            setSelectedClassId(classId);
            if (!classId) {
                setClassBaseHp(0);
                setHitDice('');
                setSpellAbilityLabel('');
                setSpellAbilityKey('');
                setClassLevelingSpecs(null);
                if (!characterId) {
                    setMoney((prev) => ({ ...prev, gp: 0 }));
                }
                return;
            }
            const cls = await getDnd5eClassById(classId);
            if (!cls?.hitPoints?.hitPointsAtFirstLevel) return;
            setClassBaseHp(Number(cls.hitPoints.hitPointsAtFirstLevel));
            setHitDice((cls.hitPoints.hitDice as unknown as string) ?? '');
            setClassLevelingSpecs(cls.levelingSpecs ?? null);
            if (!characterId) {
                setMoney((prev) => ({ ...prev, gp: rollStartingWealth(cls.name ?? '') }));
            }
            const MAGIC_CLASS_PT: Record<string, string> = {
                strength: 'Força',
                dexterity: 'Destreza',
                constitution: 'Constituição',
                intelligence: 'Inteligência',
                wisdom: 'Sabedoria',
                charisma: 'Carisma',
            };
            const magicClass: string = cls.magicClass ?? '';
            const magicClassPt = MAGIC_CLASS_PT[magicClass.toLowerCase()] ?? magicClass;
            setSpellAbilityLabel(magicClassPt || '-');
            setSpellAbilityKey(ABILITY_KEY_MAP[normalizeAbilityName(magicClass)] ?? '');
        };

        const handleApplyRaceBonus = async () => {
            if (!selectedRaceId) return;
            const race = await getDnd5eRaceById(selectedRaceId);
            if (!race?.abilityScoreIncrease) return;
            const increases: { name: string; value: number }[] =
                race.abilityScoreIncrease;
            const nextBonuses = { ...EMPTY_ABILITY_SCORES };
            for (const entry of increases) {
                const key = ABILITY_KEY_MAP[normalizeAbilityName(entry.name)];
                if (key) {
                    nextBonuses[key as AbilityKey] += Number(entry.value);
                }
            }
            setRaceAbilityBonuses(nextBonuses);
            setRaceBonusApplied(true);
        };

        useEffect(() => {
            setHpTotal(classBaseHp ? classBaseHp + numericMod(abilityScores.con) : 0);
        }, [classBaseHp, abilityScores.con]);

        const onSpellDataChangeRef = useRef(onSpellDataChange);
        onSpellDataChangeRef.current = onSpellDataChange;

        useEffect(() => {
            if (!onSpellDataChangeRef.current) return;
            const score = spellAbilityKey
                ? abilityScores[spellAbilityKey as keyof typeof abilityScores] ?? 0
                : 0;
            const mod = Math.max(0, Math.floor((score - 10) / 2));
            const spellClassName =
                classes.find((c) => c.classId === selectedClassId)?.name ?? '';
            onSpellDataChangeRef.current({
                spellClassName,
                spellAbilityLabel,
                spellCd: spellAbilityKey ? 8 + 2 + mod : 0,
                spellAttackBonus: spellAbilityKey ? 2 + mod : 0,
                levelingSpecs: classLevelingSpecs ?? undefined,
            });
        }, [
            selectedClassId,
            classes,
            spellAbilityKey,
            spellAbilityLabel,
            abilityScores,
            classLevelingSpecs,
        ]);

        useEffect(() => {
            if (!selectedRaceId) {
                setRaceSpeed(0);
                return;
            }
            getDnd5eRaceById(selectedRaceId)
                .then((race) => setRaceSpeed(race?.speed?.[0] ?? 0))
                .catch(() => {});
        }, [selectedRaceId]);

        useEffect(() => {
            getDnd5eClasses()
                .then(setClasses)
                .catch(() => {});
            getDnd5eRaces()
                .then(setRaces)
                .catch(() => {});
        }, []);

        return (
            <div>
                {showGenerateModal && (
                    <GenerateScoresModal
                        scores={generatedScores}
                        availableScoreIndexes={availableGeneratedScoreIndexes}
                        selectedAbilityLabel={
                            selectedAbilityKey
                                ? ABILITIES.find(
                                      (ability) => ability.key === selectedAbilityKey
                                  )?.label
                                : undefined
                        }
                        selectionEnabled={selectedAbilityKey !== null}
                        onSelectScore={handleSelectGeneratedScore}
                        infoMessage={GENERATED_SCORES_INFO_MESSAGE}
                        onClose={handleCloseGenerateModal}
                    />
                )}
                {/* ── Header ──────────────────────────────── */}
                <div className="cs-header">
                    <div className="cs-field cs-header-name">
                        <input
                            className="cs-field-input text-lg"
                            placeholder="Nome do Personagem"
                            value={characterName}
                            onChange={(e) => setCharacterName(e.target.value)}
                        />
                        <span className="cs-field-label">Nome do Personagem</span>
                    </div>
                    <div className="cs-field">
                        <select
                            className="cs-field-input bg-color-greyScale/200"
                            value={selectedClassId}
                            onChange={(e) => handleSelectClass(e.target.value)}
                        >
                            <option value="">Escolha sua Classe</option>
                            {classes.map((c) => (
                                <option key={c.classId} value={c.classId}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <span className="cs-field-label">Classe</span>
                    </div>
                    <div className="cs-field">
                        <input
                            className={`cs-field-input${
                                xpSystem ? ' cs-field-input--readonly' : ''
                            }`}
                            placeholder="1"
                            value={level}
                            type="number"
                            min="1"
                            onChange={(e) =>
                                setLevel(Math.max(1, Number(e.target.value) || 1))
                            }
                            readOnly={xpSystem}
                        />
                        <span className="cs-field-label">Nível</span>
                    </div>
                    <div className="cs-field">
                        <input
                            className="cs-field-input"
                            placeholder="Antecedente"
                            value={background}
                            onChange={(e) => setBackground(e.target.value)}
                        />
                        <span className="cs-field-label">Antecedente</span>
                    </div>
                    <div className="cs-field">
                        <input className="cs-field-input" placeholder="Nome do Jogador" />
                        <span className="cs-field-label">Nome do Jogador</span>
                    </div>
                    <div className="cs-field">
                        <select
                            className="cs-field-input bg-color-greyScale/200"
                            value={selectedRaceId}
                            onChange={(e) => {
                                setSelectedRaceId(e.target.value);
                                resetGeneratedScoreState();
                            }}
                        >
                            <option value="">Escolha sua Raça</option>
                            {races.map((r) => (
                                <option key={r.raceId} value={r.raceId}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                        <span className="cs-field-label">Raça</span>
                    </div>
                    <div className="cs-field">
                        <input
                            className="cs-field-input"
                            placeholder="Tendência"
                            value={alignment}
                            onChange={(e) => setAlignment(e.target.value)}
                        />
                        <span className="cs-field-label">Tendência</span>
                    </div>
                    <div className="cs-field">
                        <input
                            className="cs-field-input cs-field-input--readonly"
                            placeholder="0"
                            value={xp}
                            readOnly
                        />
                        <span className="cs-field-label">Pontos de Experiência</span>
                    </div>
                </div>

                {/* ── Body ────────────────────────────────── */}
                <div className="cs-body">
                    {/* ─ Left: Ability Scores ─ */}
                    <div className="cs-ability-col">
                        {/* ── Generate Buttons ─── */}
                        <div className="relative group w-full">
                            <button
                                type="button"
                                className="button-L-fill font-S-bold bg-color-primary/default_900 text-color-greyScale/50 w-full text-sm"
                                disabled={!selectedRaceId}
                                onClick={handleGenerateAbilityScores}
                            >
                                Gerar Valores e Modificadores
                            </button>
                            {!selectedRaceId && (
                                <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded bg-gray-800 p-2 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                    Para gerar os valores de habilidade escolha primeiro a
                                    raça
                                </div>
                            )}
                        </div>
                        <div className="relative group w-full">
                            <button
                                type="button"
                                className="button-L-fill font-S-bold bg-color-primary/default_900 text-color-greyScale/50 w-full text-sm"
                                disabled={
                                    !selectedRaceId ||
                                    !generatedScores.length ||
                                    raceBonusApplied
                                }
                                onClick={handleApplyRaceBonus}
                            >
                                Aplicar Bônus de Raças
                            </button>
                            {selectedRaceId &&
                                !generatedScores.length &&
                                !raceBonusApplied && (
                                    <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded bg-gray-800 p-2 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                        Para aplicar os Bônus de Raças primeiro gere os
                                        valores de habilidade no botão acima.
                                    </div>
                                )}
                        </div>
                        {ABILITIES.map((ab) => (
                            <div key={ab.key} className="cs-ability-block">
                                <span className="cs-ability-name">{ab.label}</span>
                                <input
                                    className="cs-ability-mod cs-field-input bg-transparent text-center w-12 cursor-not-allowed"
                                    value={calcMod(abilityScores[ab.key])}
                                    readOnly
                                    tabIndex={-1}
                                />
                                <button
                                    type="button"
                                    className="cs-ability-score"
                                    onClick={() => handleOpenAbilityScorePicker(ab.key)}
                                >
                                    {abilityScores[ab.key]}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* ─ Middle ─ */}
                    <div className="cs-middle-col">
                        {/* Inspiration & Proficiency */}
                        <div className="cs-inspiration-row">
                            <button
                                type="button"
                                className="text-sm font-bold text-color-greyScale/300 cursor-not-allowed"
                                disabled
                            >
                                OFF
                            </button>
                            <span className="cs-field-label">Inspiração</span>
                        </div>
                        <div className="cs-proficiency-row">
                            <input
                                className="cs-field-input-box w-10 text-center cs-field-input--readonly"
                                value="+2"
                                readOnly
                            />
                            <span className="cs-field-label">Bônus de Proficiência</span>
                        </div>

                        {/* Saving Throws */}
                        <div className="cs-saves-box">
                            {SAVES.map((s) => (
                                <div key={s.key} className="cs-save-row">
                                    <input
                                        type="checkbox"
                                        className="cs-save-check"
                                        checked={!!saveProfs[s.key]}
                                        onChange={(e) =>
                                            setSaveProfs((prev) => ({
                                                ...prev,
                                                [s.key]: e.target.checked,
                                            }))
                                        }
                                    />
                                    <input
                                        className={`cs-save-mod cs-field-input--readonly ${
                                            saveProfs[s.key]
                                                ? 'text-color-greyScale/900'
                                                : 'text-color-greyScale/300'
                                        }`}
                                        value={calcBonus(abilityScores[s.key])}
                                        readOnly
                                    />
                                    <span className="cs-save-name">{s.label}</span>
                                </div>
                            ))}
                            <p className="cs-section-title">Testes de Resistência</p>
                        </div>

                        {/* Skills */}
                        <div className="cs-skills-box">
                            {SKILLS.map((sk) => (
                                <div key={sk.key} className="cs-skill-row">
                                    <input
                                        type="checkbox"
                                        className="cs-save-check"
                                        checked={!!skillProfs[sk.key]}
                                        onChange={(e) =>
                                            setSkillProfs((prev) => ({
                                                ...prev,
                                                [sk.key]: e.target.checked,
                                            }))
                                        }
                                    />
                                    <input
                                        className={`cs-save-mod cs-field-input--readonly ${
                                            skillProfs[sk.key]
                                                ? 'text-color-greyScale/900'
                                                : 'text-color-greyScale/300'
                                        }`}
                                        value={calcBonus(
                                            abilityScores[SKILL_ABILITY_MAP[sk.ability]]
                                        )}
                                        readOnly
                                    />
                                    <span className="cs-save-name">
                                        {sk.label}{' '}
                                        <span className="text-color-greyScale/300">
                                            ({sk.ability})
                                        </span>
                                    </span>
                                </div>
                            ))}
                            <p className="cs-section-title">Perícias</p>
                        </div>

                        {/* Passive Wisdom */}
                        <div className="cs-passive-row">
                            <div className="cs-passive-circle">
                                <input
                                    className="w-6 text-center bg-transparent outline-none text-sm cs-field-input--readonly"
                                    value={passiveWisdom}
                                    readOnly
                                />
                            </div>
                            <span className="cs-field-label">
                                Sabedoria Passiva (Percepção)
                            </span>
                        </div>

                        {/* Combat stats */}
                        <div className="cs-combat-row">
                            <div className="cs-combat-box">
                                <input
                                    className="cs-combat-value cs-field-input text-center w-12 cs-field-input--readonly bg-transparent"
                                    value={10 + numericMod(abilityScores.dex)}
                                    readOnly
                                />
                                <span className="cs-combat-label">Classe Armad.</span>
                            </div>
                            <div className="cs-combat-box">
                                <input
                                    className="cs-combat-value cs-field-input text-center w-12 cs-field-input--readonly bg-transparent"
                                    value={calcMod(abilityScores.dex)}
                                    readOnly
                                />
                                <span className="cs-combat-label">Iniciativa</span>
                            </div>
                            <div className="cs-combat-box">
                                <input
                                    className="cs-combat-value cs-field-input text-center w-12 cs-field-input--readonly bg-transparent"
                                    value={raceSpeed || ''}
                                    placeholder="30"
                                    readOnly
                                />
                                <span className="cs-combat-label">Desloc.</span>
                            </div>
                        </div>

                        {/* HP */}
                        <div className="cs-hp-section">
                            <div className="cs-hp-total">
                                <span className="cs-field-label">PV Totais</span>
                                <input
                                    className="cs-field-input-box w-16 text-center cs-field-input--readonly"
                                    value={hpTotal}
                                    readOnly
                                />
                            </div>
                            <div className="cs-hp-current">
                                <input
                                    className="cs-field-input text-center w-20 text-2xl"
                                    type="number"
                                    placeholder="0"
                                    value={currentHp || ''}
                                    onChange={(e) => setCurrentHp(Number(e.target.value))}
                                />
                            </div>
                            <p className="cs-section-title">Pontos de Vida Atuais</p>
                        </div>

                        {/* Temp HP */}
                        <div className="cs-hp-temp">
                            <input
                                className="cs-field-input text-center w-full h-10"
                                type="number"
                                placeholder="0"
                                value={tempHp || ''}
                                onChange={(e) => setTempHp(Number(e.target.value))}
                            />
                            <p className="cs-section-title">Pontos de Vida Temporários</p>
                        </div>

                        {/* Hit Dice & Death Saves */}
                        <div className="flex gap-3">
                            <div className="cs-hit-dice flex-1">
                                <span className="cs-field-label">Total</span>
                                <input
                                    className="cs-field-input-box w-full text-center cs-field-input--readonly"
                                    value={hitDice}
                                    placeholder="1d10"
                                    readOnly
                                />
                                <p className="cs-section-title">Dados de Vida</p>
                            </div>
                            <div className="cs-hit-dice flex-1">
                                <div className="cs-death-saves">
                                    <div className="cs-death-save-group">
                                        <span className="text-[0.6rem] uppercase text-color-greyScale/500">
                                            Sucessos
                                        </span>
                                        <div className="cs-death-save-dots">
                                            {[0, 1, 2].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`cs-death-dot cursor-pointer${
                                                        i < deathSaves.success
                                                            ? ' cs-death-dot--filled'
                                                            : ''
                                                    }`}
                                                    onClick={() =>
                                                        setDeathSaves((prev) => ({
                                                            ...prev,
                                                            success:
                                                                prev.success === i + 1
                                                                    ? i
                                                                    : i + 1,
                                                        }))
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="cs-death-save-group">
                                        <span className="text-[0.6rem] uppercase text-color-greyScale/500">
                                            Fracassos
                                        </span>
                                        <div className="cs-death-save-dots">
                                            {[0, 1, 2].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`cs-death-dot cursor-pointer${
                                                        i < deathSaves.failures
                                                            ? ' cs-death-dot--filled'
                                                            : ''
                                                    }`}
                                                    onClick={() =>
                                                        setDeathSaves((prev) => ({
                                                            ...prev,
                                                            failures:
                                                                prev.failures === i + 1
                                                                    ? i
                                                                    : i + 1,
                                                        }))
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="cs-section-title">Testes contra a Morte</p>
                            </div>
                        </div>

                        {/* Attacks */}
                        <div className="cs-attacks-box">
                            <div className="cs-attack-header">
                                <span>Nome</span>
                                <span>Bônus</span>
                                <span>Dano/Tipo</span>
                            </div>
                            {attacks.map((atk, i) => (
                                <div key={i} className="cs-attack-row">
                                    <input
                                        className="cs-field-input"
                                        value={atk.name}
                                        onChange={(e) =>
                                            setAttacks((prev) =>
                                                prev.map((a, j) =>
                                                    j === i
                                                        ? { ...a, name: e.target.value }
                                                        : a
                                                )
                                            )
                                        }
                                    />
                                    <input
                                        className="cs-field-input"
                                        value={atk.atkBonus}
                                        onChange={(e) =>
                                            setAttacks((prev) =>
                                                prev.map((a, j) =>
                                                    j === i
                                                        ? {
                                                              ...a,
                                                              atkBonus: e.target.value,
                                                          }
                                                        : a
                                                )
                                            )
                                        }
                                    />
                                    <input
                                        className="cs-field-input"
                                        value={atk.damageRaw}
                                        onChange={(e) =>
                                            setAttacks((prev) =>
                                                prev.map((a, j) =>
                                                    j === i
                                                        ? {
                                                              ...a,
                                                              damageRaw: e.target.value,
                                                          }
                                                        : a
                                                )
                                            )
                                        }
                                    />
                                </div>
                            ))}
                            <p className="cs-section-title">Ataques e Magias</p>
                        </div>

                        {/* Inventory */}
                        <div className="cs-equipment-box">
                            <div className="cs-inventory-currency-row">
                                {(['cp', 'sp', 'ep', 'gp', 'pp'] as const).map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className="cs-inventory-currency-item cursor-pointer"
                                        onClick={() => setMoneyModalKey(key)}
                                    >
                                        <span className="cs-inventory-currency-label">
                                            {CURRENCY_LABELS[key]}
                                        </span>
                                        <span className="cs-inventory-currency-input cs-field-input--readonly flex items-center justify-center">
                                            {money[key]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="cs-inventory-panel">
                                <textarea
                                    className="cs-inventory-textarea"
                                    placeholder="Itens, recursos e observações..."
                                    value={inventory}
                                    onChange={(e) => setInventory(e.target.value)}
                                />
                            </div>
                            <p className="cs-section-title">Inventário</p>
                        </div>
                    </div>

                    {/* ─ Right: Personality ─ */}
                    <div className="cs-right-col">
                        <div className="cs-trait-box">
                            <textarea
                                className="cs-field-textarea w-full h-16"
                                placeholder="Traços de Personalidade..."
                                value={personalityTraits}
                                onChange={(e) => setPersonalityTraits(e.target.value)}
                            />
                            <p className="cs-section-title">Traços de Personalidade</p>
                        </div>
                        <div className="cs-trait-box">
                            <textarea
                                className="cs-field-textarea w-full h-16"
                                placeholder="Ideais..."
                                value={ideals}
                                onChange={(e) => setIdeals(e.target.value)}
                            />
                            <p className="cs-section-title">Ideais</p>
                        </div>
                        <div className="cs-trait-box">
                            <textarea
                                className="cs-field-textarea w-full h-16"
                                placeholder="Ligações..."
                                value={bonds}
                                onChange={(e) => setBonds(e.target.value)}
                            />
                            <p className="cs-section-title">Ligações</p>
                        </div>
                        <div className="cs-trait-box">
                            <textarea
                                className="cs-field-textarea w-full h-16"
                                placeholder="Defeitos..."
                                value={flaws}
                                onChange={(e) => setFlaws(e.target.value)}
                            />
                            <p className="cs-section-title">Defeitos</p>
                        </div>
                    </div>
                </div>

                {/* ── Bottom row ──────────────────────────── */}
                <div className="cs-bottom-row">
                    <div className="cs-bottom-box">
                        <textarea
                            className="cs-field-textarea w-full h-full"
                            placeholder="Idiomas e proficiências..."
                            value={proficienciesText}
                            onChange={(e) => setProficienciesText(e.target.value)}
                        />
                        <p className="cs-section-title my-4">
                            Idiomas e Outras Proficiências
                        </p>
                    </div>
                    <div className="cs-bottom-box">
                        <textarea
                            className="cs-field-textarea w-full h-full"
                            placeholder="Características e habilidades..."
                            value={extraCharacteristics}
                            onChange={(e) => setExtraCharacteristics(e.target.value)}
                        />
                        <p className="cs-section-title my-4">
                            Características e Habilidades
                        </p>
                    </div>
                </div>

                {moneyModalKey !== null && (
                    <MoneyModal
                        currencyLabel={CURRENCY_LABELS[moneyModalKey]}
                        currentAmount={money[moneyModalKey]}
                        onConfirm={(delta) => {
                            setMoney((prev) => ({
                                ...prev,
                                [moneyModalKey]: Math.max(0, prev[moneyModalKey] + delta),
                            }));
                            setMoneyModalKey(null);
                        }}
                        onClose={() => setMoneyModalKey(null)}
                    />
                )}

                {xpModalOpen && (
                    <XpIncreaseModal
                        currentXp={xp}
                        xpSystemEnabled={xpSystem}
                        onClose={() => setXpModalOpen(false)}
                        onConfirm={(addedXp) => {
                            if (xpSystem) {
                                const nextProgression = applyXpGain(xp, addedXp);
                                setXp(nextProgression.xp);
                                setLevel(nextProgression.level);
                            } else {
                                setXp((currentXp) => currentXp + addedXp);
                            }
                            setXpModalOpen(false);
                        }}
                    />
                )}
            </div>
        );
    }
);

export default SheetPrincipal;
