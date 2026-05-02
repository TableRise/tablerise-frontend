'use client';
import { useEffect, useRef, useState } from 'react';
import {
    getDnd5eClasses,
    getDnd5eRaces,
    getDnd5eRaceById,
    getDnd5eClassById,
} from '@/server/dungeons&dragons5e/system';
import GenerateScoresModal from '@/components/character-sheet/GenerateScoresModal';

const ABILITIES = [
    { key: 'str', label: 'Força' },
    { key: 'dex', label: 'Destreza' },
    { key: 'con', label: 'Constituição' },
    { key: 'int', label: 'Inteligência' },
    { key: 'wis', label: 'Sabedoria' },
    { key: 'cha', label: 'Carisma' },
] as const;

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

interface SheetPrincipalProps {
    campaignId: string;
    characterId: string;
    onSpellDataChange?: (data: {
        spellClassName: string;
        spellAbilityLabel: string;
        spellCd: number;
        spellAttackBonus: number;
        levelingSpecs?: {
            cantripsKnown: { isValidToThisClass: boolean; amount: number[] };
            spellsKnown: { isValidToThisClass: boolean; amount: number[] };
            spellSlotsPerSpellLevel: {
                isValidToThisClass: boolean;
                spellLevel: number[];
                spellSpaces: number[][];
            };
        };
    }) => void;
}

export default function SheetPrincipal({
    campaignId,
    characterId,
    onSpellDataChange,
}: SheetPrincipalProps): JSX.Element {
    const [classes, setClasses] = useState<{ classId: string; pt: { name: string } }[]>(
        []
    );
    const [selectedClassId, setSelectedClassId] = useState('');
    const [classBaseHp, setClassBaseHp] = useState(0);
    const [hitDice, setHitDice] = useState('');
    const [hpTotal, setHpTotal] = useState(0);
    const [spellAbilityLabel, setSpellAbilityLabel] = useState('');
    const [spellAbilityKey, setSpellAbilityKey] = useState('');
    const [classLevelingSpecs, setClassLevelingSpecs] = useState<any>(null);
    const [races, setRaces] = useState<{ raceId: string; pt: { name: string } }[]>([]);
    const [selectedRaceId, setSelectedRaceId] = useState('');
    const [raceSpeed, setRaceSpeed] = useState(0);
    const [raceBonusApplied, setRaceBonusApplied] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [skillProfs, setSkillProfs] = useState<Record<string, boolean>>({});
    const [saveProfs, setSaveProfs] = useState<Record<string, boolean>>({});
    type AbilityKey = (typeof ABILITIES)[number]['key'];
    const [abilityScores, setAbilityScores] = useState<Record<AbilityKey, number>>({
        str: 0,
        dex: 0,
        con: 0,
        int: 0,
        wis: 0,
        cha: 0,
    });

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

    const ABILITY_KEY_MAP: Record<string, string> = {
        strength: 'str',
        dexterity: 'dex',
        constitution: 'con',
        intelligence: 'int',
        wisdom: 'wis',
        charisma: 'cha',
        força: 'str',
        destreza: 'dex',
        constituição: 'con',
        inteligência: 'int',
        sabedoria: 'wis',
        carisma: 'cha',
    };

    const handleSelectClass = async (classId: string) => {
        setSelectedClassId(classId);
        if (!classId) {
            setClassBaseHp(0);
            setHitDice('');
            setSpellAbilityLabel('');
            setSpellAbilityKey('');
            setClassLevelingSpecs(null);
            return;
        }
        const cls = await getDnd5eClassById(classId);
        if (!cls?.en?.hitPoints?.hitPointsAtFirstLevel) return;
        setClassBaseHp(Number(cls.en.hitPoints.hitPointsAtFirstLevel));
        setHitDice(cls.en.hitPoints.hitDice?.[0] ?? '');
        setClassLevelingSpecs(cls.levelingSpecs ?? cls.en?.levelingSpecs ?? null);
        const MAGIC_CLASS_PT: Record<string, string> = {
            strength: 'Força',
            dexterity: 'Destreza',
            constitution: 'Constituição',
            intelligence: 'Inteligência',
            wisdom: 'Sabedoria',
            charisma: 'Carisma',
        };
        const magicClass: string = cls.magicClass ?? cls.en?.magicClass ?? '';
        const magicClassPt = MAGIC_CLASS_PT[magicClass.toLowerCase()] ?? magicClass;
        setSpellAbilityLabel(magicClassPt || '-');
        setSpellAbilityKey(ABILITY_KEY_MAP[magicClass.toLowerCase()] ?? '');
    };

    const handleApplyRaceBonus = async () => {
        if (!selectedRaceId) return;
        const race = await getDnd5eRaceById(selectedRaceId);
        if (!race?.en?.abilityScoreIncrease) return;
        const increases: { name: string; value: number }[] = race.en.abilityScoreIncrease;
        setAbilityScores((prev) => {
            const next = { ...prev };
            for (const entry of increases) {
                const key = ABILITY_KEY_MAP[entry.name.toLowerCase()];
                if (key) next[key as keyof typeof prev] += Number(entry.value);
            }
            return next;
        });
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
            classes.find((c) => c.classId === selectedClassId)?.pt.name ?? '';
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
            .then((race) => setRaceSpeed(race?.en.speed?.[0] ?? 0))
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
                <GenerateScoresModal onClose={() => setShowGenerateModal(false)} />
            )}
            {/* ── Header ──────────────────────────────── */}
            <div className="cs-header">
                <div className="cs-field cs-header-name">
                    <input
                        className="cs-field-input text-lg"
                        placeholder="Nome do Personagem"
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
                                {c.pt.name}
                            </option>
                        ))}
                    </select>
                    <span className="cs-field-label">Classe</span>
                </div>
                <div className="cs-field">
                    <input
                        className="cs-field-input cs-field-input--readonly"
                        placeholder="1"
                        value={1}
                        readOnly
                    />
                    <span className="cs-field-label">Nível</span>
                </div>
                <div className="cs-field">
                    <input className="cs-field-input" placeholder="Antecedente" />
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
                            setRaceBonusApplied(false);
                            setAbilityScores({
                                str: 0,
                                dex: 0,
                                con: 0,
                                int: 0,
                                wis: 0,
                                cha: 0,
                            });
                        }}
                    >
                        <option value="">Escolha sua Raça</option>
                        {races.map((r) => (
                            <option key={r.raceId} value={r.raceId}>
                                {r.pt.name}
                            </option>
                        ))}
                    </select>
                    <span className="cs-field-label">Raça</span>
                </div>
                <div className="cs-field">
                    <input className="cs-field-input" placeholder="Tendência" />
                    <span className="cs-field-label">Tendência</span>
                </div>
                <div className="cs-field">
                    <input
                        className="cs-field-input cs-field-input--readonly"
                        placeholder="0"
                        value={0}
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
                    <button
                        type="button"
                        className="button-L-fill font-S-bold bg-color-primary/default_900 text-color-greyScale/50 w-full text-sm"
                        onClick={() => setShowGenerateModal(true)}
                    >
                        Gerar Valores e Modificadores
                    </button>
                    <button
                        type="button"
                        className="button-L-fill font-S-bold bg-color-primary/default_900 text-color-greyScale/50 w-full text-sm"
                        disabled={!selectedRaceId || raceBonusApplied}
                        onClick={handleApplyRaceBonus}
                    >
                        Aplicar Bonus de Raças
                    </button>
                    {ABILITIES.map((ab) => (
                        <div key={ab.key} className="cs-ability-block">
                            <span className="cs-ability-name">{ab.label}</span>
                            <input
                                className="cs-ability-mod cs-field-input bg-transparent text-center w-12 cursor-not-allowed"
                                value={calcMod(abilityScores[ab.key])}
                                readOnly
                                tabIndex={-1}
                            />
                            <input
                                className="cs-ability-score"
                                type="number"
                                value={abilityScores[ab.key]}
                                onChange={(e) =>
                                    setAbilityScores((prev) => ({
                                        ...prev,
                                        [ab.key]: Number(e.target.value),
                                    }))
                                }
                            />
                        </div>
                    ))}
                </div>

                {/* ─ Middle ─ */}
                <div className="cs-middle-col">
                    {/* Inspiration & Proficiency */}
                    <div className="cs-inspiration-row">
                        <span className="text-sm font-bold text-color-greyScale/300">
                            OFF
                        </span>
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
                                placeholder="0"
                            />
                        </div>
                        <p className="cs-section-title">Pontos de Vida Atuais</p>
                    </div>

                    {/* Temp HP */}
                    <div className="cs-hp-temp">
                        <input
                            className="cs-field-input text-center w-full h-10"
                            placeholder="0"
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
                                            <div key={i} className="cs-death-dot" />
                                        ))}
                                    </div>
                                </div>
                                <div className="cs-death-save-group">
                                    <span className="text-[0.6rem] uppercase text-color-greyScale/500">
                                        Fracassos
                                    </span>
                                    <div className="cs-death-save-dots">
                                        {[0, 1, 2].map((i) => (
                                            <div key={i} className="cs-death-dot" />
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
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="cs-attack-row">
                                <input className="cs-field-input" />
                                <input className="cs-field-input" />
                                <input className="cs-field-input" />
                            </div>
                        ))}
                        <p className="cs-section-title">Ataques e Magias</p>
                    </div>

                    {/* Inventory */}
                    <div className="cs-equipment-box">
                        <div className="cs-inventory-currency-row">
                            {['CP', 'SP', 'EP', 'GP', 'PP'].map((currency) => (
                                <label
                                    key={currency}
                                    className="cs-inventory-currency-item"
                                >
                                    <span className="cs-inventory-currency-label">
                                        {currency}
                                    </span>
                                    <input
                                        className="cs-inventory-currency-input"
                                        type="number"
                                    />
                                </label>
                            ))}
                        </div>
                        <div className="cs-inventory-panel">
                            <textarea
                                className="cs-inventory-textarea"
                                placeholder="Itens, recursos e observações..."
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
                        />
                        <p className="cs-section-title">Traços de Personalidade</p>
                    </div>
                    <div className="cs-trait-box">
                        <textarea
                            className="cs-field-textarea w-full h-16"
                            placeholder="Ideais..."
                        />
                        <p className="cs-section-title">Ideais</p>
                    </div>
                    <div className="cs-trait-box">
                        <textarea
                            className="cs-field-textarea w-full h-16"
                            placeholder="Ligações..."
                        />
                        <p className="cs-section-title">Ligações</p>
                    </div>
                    <div className="cs-trait-box">
                        <textarea
                            className="cs-field-textarea w-full h-16"
                            placeholder="Defeitos..."
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
                    />
                    <p className="cs-section-title my-4">
                        Idiomas e Outras Proficiências
                    </p>
                </div>
                <div className="cs-bottom-box">
                    <textarea
                        className="cs-field-textarea w-full h-full"
                        placeholder="Características e habilidades..."
                    />
                    <p className="cs-section-title my-4">Características e Habilidades</p>
                </div>
            </div>
        </div>
    );
}
