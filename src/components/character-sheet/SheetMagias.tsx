'use client';
import { forwardRef, useImperativeHandle, useState } from 'react';
import Image from 'next/image';
import Book from '../../../assets/icons/nav/book.svg?url';
import {
    getDnd5eSpellsByLevel,
    getDnd5eSpellById,
} from '@/server/dungeons&dragons5e/system';

interface HigherLevel {
    homebrew: boolean;
    level: string;
    damage: string[];
    buffs: string[];
    debuffs: string[];
}

interface SpellLocale {
    homebrew: boolean;
    name: string;
    description: string;
    type: string;
    level: number;
    higherLevels: HigherLevel[];
    damage: string[];
    castingTime: string;
    duration: string;
    range: string;
    components: string;
    buffs: string[];
    debuffs: string[];
}

interface Spell {
    active: boolean;
    spellId: string;
    en: SpellLocale;
    pt: SpellLocale;
}

interface LevelingSpecs {
    cantripsKnown: { isValidToThisClass: boolean; amount: number[] };
    spellsKnown: { isValidToThisClass: boolean; amount: number[] };
    spellSlotsPerSpellLevel: {
        isValidToThisClass: boolean;
        spellLevel: number[];
        spellSpaces: number[][];
    };
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

interface SheetMagiasProps {
    campaignId: string;
    characterId: string;
    spellClassName?: string;
    spellAbilityLabel?: string;
    spellCd?: number;
    spellAttackBonus?: number;
    levelingSpecs?: LevelingSpecs;
}

export interface SheetMagiasHandle {
    getData: () => {
        spellNames: Record<number, { name: string; spellId: string }[]>;
        slotsExpended: Record<number, number>;
        slotTotals: Record<number, number>;
    };
}

const SheetMagias = forwardRef<SheetMagiasHandle, SheetMagiasProps>(
    function SheetMagias(
        {
            campaignId,
            characterId,
            spellClassName = '',
            spellAbilityLabel = '',
            spellCd = 0,
            spellAttackBonus = 0,
            levelingSpecs,
        },
        ref
    ) {
    const getActiveSlots = (spellLevel: number): number => {
        if (!levelingSpecs) return SPELLS_PER_LEVEL;
        if (spellLevel === 0) {
            return levelingSpecs.cantripsKnown.isValidToThisClass
                ? levelingSpecs.cantripsKnown.amount[0] ?? 0
                : 0;
        }
        const slotCount = levelingSpecs.spellSlotsPerSpellLevel.isValidToThisClass
            ? levelingSpecs.spellSlotsPerSpellLevel.spellSpaces[0]?.[spellLevel - 1] ?? 0
            : 0;
        if (slotCount === 0) return 0;
        return levelingSpecs.spellsKnown.isValidToThisClass
            ? levelingSpecs.spellsKnown.amount[0] ?? SPELLS_PER_LEVEL
            : SPELLS_PER_LEVEL;
    };

    const getSlotTotal = (spellLevel: number): number => {
        if (!levelingSpecs || !levelingSpecs.spellSlotsPerSpellLevel.isValidToThisClass)
            return 0;
        return (
            levelingSpecs.spellSlotsPerSpellLevel.spellSpaces[0]?.[spellLevel - 1] ?? 0
        );
    };
    const [pickerLevel, setPickerLevel] = useState<number | null>(null);
    const [pickerSpells, setPickerSpells] = useState<Spell[]>([]);
    const [pickerSearch, setPickerSearch] = useState('');
    const [pickerLoading, setPickerLoading] = useState(false);
    const [openSpellIdx, setOpenSpellIdx] = useState<number | null>(null);
    const [spellNames, setSpellNames] = useState<
        Record<number, { name: string; spellId: string }[]>
    >(
        () =>
            Object.fromEntries(
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => [
                    l,
                    Array(SPELLS_PER_LEVEL).fill({ name: '', spellId: '' }),
                ])
            ) as Record<number, { name: string; spellId: string }[]>
    );
    const [detailSpell, setDetailSpell] = useState<Spell | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [slotsExpended, setSlotsExpended] = useState<Record<number, number>>(
        () => Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => [l, 0]))
    );

    const handleOpenPicker = async (level: number) => {
        setPickerLevel(level);
        setPickerSearch('');
        setOpenSpellIdx(null);
        setPickerLoading(true);
        const result = await getDnd5eSpellsByLevel(level);
        setPickerSpells(result);
        setPickerLoading(false);
    };

    const closePicker = () => setPickerLevel(null);

    const handleChooseSpell = (spellName: string, spellId: string) => {
        if (pickerLevel === null) return;
        setSpellNames((prev) => {
            const current = [...prev[pickerLevel]];
            const emptyIdx = current.findIndex((v) => v.name === '');
            if (emptyIdx !== -1) current[emptyIdx] = { name: spellName, spellId };
            return { ...prev, [pickerLevel]: current };
        });
        closePicker();
    };

    const handleOpenDetail = async (spellId: string) => {
        if (!spellId) return;
        setDetailLoading(true);
        setDetailSpell(null);
        const result = await getDnd5eSpellById(spellId);
        setDetailSpell(result);
        setDetailLoading(false);
    };

    const closeDetail = () => setDetailSpell(null);

    const handleClearSpell = (level: number, idx: number) => {
        setSpellNames((prev) => {
            const current = [...prev[level]];
            current[idx] = { name: '', spellId: '' };
            return { ...prev, [level]: current };
        });
    };

    const formatBadges = (list: string[], sentinel: string) =>
        list.filter((v) => v !== sentinel);

    useImperativeHandle(ref, () => ({
        getData: () => {
            const slotTotals: Record<number, number> = {};
            for (let l = 1; l <= 9; l++) slotTotals[l] = Number(getSlotTotal(l));
            const coercedExpended: Record<number, number> = {};
            for (let l = 1; l <= 9; l++)
                coercedExpended[l] = Number(slotsExpended[l] ?? 0);
            return { spellNames, slotsExpended: coercedExpended, slotTotals };
        },
    }));

    const filteredSpells = pickerSpells.filter((s) =>
        s.pt.name.toLowerCase().includes(pickerSearch.toLowerCase())
    );

    const detailBuffs = detailSpell ? formatBadges(detailSpell.pt.buffs, 'no-buff') : [];
    const detailDebuffs = detailSpell
        ? formatBadges(detailSpell.pt.debuffs, 'no-debuffs')
        : [];

    return (
        <>
            {/* ── Spellcasting header ─────────────────── */}
            <div className="cs-spell-header">
                <div className="cs-spell-header-box">
                    <input
                        className="cs-field-input text-center cs-field-input--readonly bg-transparent"
                        value={spellClassName}
                        placeholder="Classe"
                        readOnly
                    />
                    <span className="cs-field-label">Classe de Magia</span>
                </div>
                <div className="cs-spell-header-box">
                    <input
                        className="cs-field-input text-center cs-field-input--readonly bg-transparent"
                        value={spellAbilityLabel}
                        placeholder="—"
                        readOnly
                    />
                    <span className="cs-field-label">Habilidade-Chave de Magia</span>
                </div>
                <div className="cs-spell-header-box">
                    <input
                        className="cs-field-input text-center cs-field-input--readonly bg-transparent"
                        value={spellCd || ''}
                        placeholder="0"
                        readOnly
                    />
                    <span className="cs-field-label">CD Resistência de Magia</span>
                </div>
                <div className="cs-spell-header-box">
                    <input
                        className="cs-field-input text-center cs-field-input--readonly bg-transparent"
                        value={spellAttackBonus ? `+${spellAttackBonus}` : ''}
                        placeholder="+0"
                        readOnly
                    />
                    <span className="cs-field-label">Bônus de Ataque com Magia</span>
                </div>
            </div>

            {/* ── Spell levels grid ───────────────────── */}
            <div className="cs-spell-grid">
                {SPELL_LEVELS.map((sl) => (
                    <div key={sl.level} className="cs-spell-level-box">
                        <div className="cs-spell-level-header">
                            {(() => {
                                const activeSlots = getActiveSlots(sl.level);
                                const filledSlots = spellNames[sl.level]
                                    .slice(0, activeSlots)
                                    .filter((e) => e.name !== '').length;
                                const bookDisabled =
                                    activeSlots === 0 || filledSlots >= activeSlots;
                                return (
                                    <Image
                                        src={Book.src}
                                        alt="search"
                                        width={32}
                                        height={32}
                                        className={`transition-opacity ${
                                            bookDisabled
                                                ? 'opacity-30 pointer-events-none'
                                                : 'cursor-pointer hover:opacity-70'
                                        }`}
                                        onClick={() =>
                                            !bookDisabled && handleOpenPicker(sl.level)
                                        }
                                    />
                                );
                            })()}
                            <div className="cs-spell-level-badge">
                                {sl.level === 0 ? 'T' : sl.level}
                            </div>
                            {sl.slots && (
                                <div className="cs-spell-slots">
                                    <span>Total</span>
                                    <input
                                        className="cs-spell-slot-input"
                                        value={getSlotTotal(sl.level) || ''}
                                        placeholder="0"
                                        readOnly
                                    />
                                    <span>Usados</span>
                                    <input
                                        className="cs-spell-slot-input"
                                        type="number"
                                        placeholder="0"
                                        value={slotsExpended[sl.level] || ''}
                                        onChange={(e) =>
                                            setSlotsExpended((prev) => ({
                                                ...prev,
                                                [sl.level]: Number(e.target.value),
                                            }))
                                        }
                                    />
                                </div>
                            )}
                        </div>
                        <div className="cs-spell-list">
                            {Array.from({ length: SPELLS_PER_LEVEL }).map((_, idx) => {
                                const activeSlots = getActiveSlots(sl.level);
                                const inactive = idx >= activeSlots;
                                return (
                                    <div key={idx} className="cs-spell-row">
                                        {sl.level > 0 && (
                                            <input
                                                type="checkbox"
                                                className="cs-spell-check"
                                                disabled={inactive}
                                                style={
                                                    inactive
                                                        ? {
                                                              opacity: 0.3,
                                                              pointerEvents: 'none',
                                                          }
                                                        : {}
                                                }
                                            />
                                        )}
                                        <input
                                            className={`cs-spell-name-input${
                                                inactive
                                                    ? ' cs-spell-name-input--inactive'
                                                    : spellNames[sl.level][idx].name
                                                    ? ' cursor-pointer hover:opacity-70'
                                                    : ''
                                            }`}
                                            value={spellNames[sl.level][idx].name}
                                            readOnly
                                            onClick={() => {
                                                if (inactive) return;
                                                const entry = spellNames[sl.level][idx];
                                                if (entry.spellId)
                                                    handleOpenDetail(entry.spellId);
                                            }}
                                            placeholder={
                                                sl.level === 0
                                                    ? `Truque ${idx + 1}`
                                                    : `Magia ${idx + 1}`
                                            }
                                        />
                                        {!inactive && spellNames[sl.level][idx].name && (
                                            <button
                                                type="button"
                                                className="cs-spell-clear-btn"
                                                onClick={() =>
                                                    handleClearSpell(sl.level, idx)
                                                }
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Spell picker modal ──────────────────── */}
            {pickerLevel !== null && (
                <div className="cs-spell-picker-overlay" onClick={closePicker}>
                    <div
                        className="cs-spell-picker-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="cs-spell-picker-header">
                            <h2 className="font-S-bold text-base text-color-greyScale/900">
                                {pickerLevel === 0
                                    ? 'Truques'
                                    : `Magias de Nível ${pickerLevel}`}
                            </h2>
                            <button
                                type="button"
                                className="cs-spell-picker-close"
                                onClick={closePicker}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Search */}
                        <input
                            className="cs-spell-picker-search"
                            placeholder="Buscar magia..."
                            value={pickerSearch}
                            onChange={(e) => setPickerSearch(e.target.value)}
                        />

                        {/* Spell list */}
                        <div className="cs-spell-picker-list">
                            {pickerLoading && (
                                <p className="text-center text-sm text-color-greyScale/500 py-8">
                                    Carregando...
                                </p>
                            )}
                            {!pickerLoading && filteredSpells.length === 0 && (
                                <p className="text-center text-sm text-color-greyScale/500 py-8">
                                    Nenhuma magia encontrada.
                                </p>
                            )}
                            {!pickerLoading &&
                                filteredSpells.map((spell, idx) => {
                                    const isOpen = openSpellIdx === idx;
                                    const realDebuffs = formatBadges(
                                        spell.pt.debuffs,
                                        'no-debuffs'
                                    );
                                    const realBuffs = formatBadges(
                                        spell.pt.buffs,
                                        'no-buff'
                                    );
                                    return (
                                        <div
                                            key={idx}
                                            className="cs-spell-accordion-item"
                                        >
                                            {/* Trigger */}
                                            <button
                                                type="button"
                                                className="cs-spell-accordion-trigger"
                                                onClick={() =>
                                                    setOpenSpellIdx(isOpen ? null : idx)
                                                }
                                            >
                                                <span className="font-semibold">
                                                    {spell.pt.name}
                                                </span>
                                                <span className="cs-spell-accordion-chevron">
                                                    {isOpen ? '▲' : '▼'}
                                                </span>
                                            </button>

                                            {/* Body */}
                                            {isOpen && (
                                                <div className="cs-spell-accordion-body">
                                                    <p className="text-xs text-color-greyScale/700 leading-relaxed mb-3">
                                                        {spell.pt.description}
                                                    </p>

                                                    <div className="cs-spell-accordion-fields">
                                                        <div className="cs-spell-accordion-field">
                                                            <span className="cs-spell-accordion-field-label">
                                                                Tipo
                                                            </span>
                                                            <span className="cs-spell-accordion-field-value">
                                                                {spell.pt.type}
                                                            </span>
                                                        </div>
                                                        <div className="cs-spell-accordion-field">
                                                            <span className="cs-spell-accordion-field-label">
                                                                Tempo de Conjuração
                                                            </span>
                                                            <span className="cs-spell-accordion-field-value">
                                                                {spell.pt.castingTime}
                                                            </span>
                                                        </div>
                                                        <div className="cs-spell-accordion-field">
                                                            <span className="cs-spell-accordion-field-label">
                                                                Duração
                                                            </span>
                                                            <span className="cs-spell-accordion-field-value">
                                                                {spell.pt.duration}
                                                            </span>
                                                        </div>
                                                        <div className="cs-spell-accordion-field">
                                                            <span className="cs-spell-accordion-field-label">
                                                                Alcance
                                                            </span>
                                                            <span className="cs-spell-accordion-field-value">
                                                                {spell.pt.range}
                                                            </span>
                                                        </div>
                                                        <div className="cs-spell-accordion-field">
                                                            <span className="cs-spell-accordion-field-label">
                                                                Componentes
                                                            </span>
                                                            <span className="cs-spell-accordion-field-value">
                                                                {spell.pt.components}
                                                            </span>
                                                        </div>
                                                        {spell.pt.damage.length > 0 && (
                                                            <div className="cs-spell-accordion-field">
                                                                <span className="cs-spell-accordion-field-label">
                                                                    Dano
                                                                </span>
                                                                <span className="cs-spell-accordion-field-value">
                                                                    {spell.pt.damage.join(
                                                                        ', '
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {realBuffs.length > 0 && (
                                                            <div className="cs-spell-accordion-field">
                                                                <span className="cs-spell-accordion-field-label">
                                                                    Benefícios
                                                                </span>
                                                                <span className="cs-spell-accordion-field-value">
                                                                    {realBuffs.join(', ')}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {realDebuffs.length > 0 && (
                                                            <div className="cs-spell-accordion-field">
                                                                <span className="cs-spell-accordion-field-label">
                                                                    Penalidades
                                                                </span>
                                                                <span className="cs-spell-accordion-field-value">
                                                                    {realDebuffs.join(
                                                                        ', '
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {spell.pt.higherLevels.length >
                                                            0 && (
                                                            <div className="cs-spell-accordion-field cs-spell-accordion-field--full">
                                                                <span className="cs-spell-accordion-field-label">
                                                                    Em Níveis Superiores
                                                                </span>
                                                                <span className="cs-spell-accordion-field-value">
                                                                    {
                                                                        spell.pt
                                                                            .higherLevels[0]
                                                                            .level
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="cs-spell-picker-choose-btn"
                                                        onClick={() =>
                                                            handleChooseSpell(
                                                                spell.pt.name,
                                                                spell.spellId
                                                            )
                                                        }
                                                    >
                                                        Escolher magia
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Spell detail modal ──────────────────── */}
            {(detailSpell !== null || detailLoading) && (
                <div className="cs-spell-picker-overlay" onClick={closeDetail}>
                    <div
                        className="cs-spell-picker-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="cs-spell-picker-header">
                            <h2 className="font-S-bold text-base">
                                {detailLoading ? 'Carregando...' : detailSpell?.pt.name}
                            </h2>
                            <button
                                type="button"
                                className="cs-spell-picker-close"
                                onClick={closeDetail}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="cs-spell-picker-list">
                            {detailLoading && (
                                <p className="text-center text-sm py-8">Carregando...</p>
                            )}
                            {!detailLoading && detailSpell && (
                                <div className="cs-spell-accordion-body border-none px-0">
                                    <p className="text-xs leading-relaxed mb-3">
                                        {detailSpell.pt.description}
                                    </p>
                                    <div className="cs-spell-accordion-fields">
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Tipo
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {detailSpell.pt.type}
                                            </span>
                                        </div>
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Tempo de Conjuração
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {detailSpell.pt.castingTime}
                                            </span>
                                        </div>
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Duração
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {detailSpell.pt.duration}
                                            </span>
                                        </div>
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Alcance
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {detailSpell.pt.range}
                                            </span>
                                        </div>
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Componentes
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {detailSpell.pt.components}
                                            </span>
                                        </div>
                                        {detailSpell.pt.damage.length > 0 && (
                                            <div className="cs-spell-accordion-field">
                                                <span className="cs-spell-accordion-field-label">
                                                    Dano
                                                </span>
                                                <span className="cs-spell-accordion-field-value">
                                                    {detailSpell.pt.damage.join(', ')}
                                                </span>
                                            </div>
                                        )}
                                        {detailBuffs.length > 0 && (
                                            <div className="cs-spell-accordion-field">
                                                <span className="cs-spell-accordion-field-label">
                                                    Benefícios
                                                </span>
                                                <span className="cs-spell-accordion-field-value">
                                                    {detailBuffs.join(', ')}
                                                </span>
                                            </div>
                                        )}
                                        {detailDebuffs.length > 0 && (
                                            <div className="cs-spell-accordion-field">
                                                <span className="cs-spell-accordion-field-label">
                                                    Penalidades
                                                </span>
                                                <span className="cs-spell-accordion-field-value">
                                                    {detailDebuffs.join(', ')}
                                                </span>
                                            </div>
                                        )}
                                        {detailSpell.pt.higherLevels.length > 0 && (
                                            <div className="cs-spell-accordion-field cs-spell-accordion-field--full">
                                                <span className="cs-spell-accordion-field-label">
                                                    Em Níveis Superiores
                                                </span>
                                                <span className="cs-spell-accordion-field-value">
                                                    {detailSpell.pt.higherLevels[0].level}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
);

export default SheetMagias;
