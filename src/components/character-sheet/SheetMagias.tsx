'use client';
import { forwardRef, useContext, useImperativeHandle, useState } from 'react';
import Image from 'next/image';
import Book from '../../../assets/icons/nav/book.svg?url';
import BookDark from '../../../assets/icons/nav/book-dark.svg?url';
import LoadingDots from '@/components/common/LoadingDots';
import TableriseContext from '@/context/TableriseContext';
import {
    getDnd5eSpellsByLevel,
    getDnd5eSpellById,
} from '@/server/dungeons&dragons5e/system';
import { getLevelingSnapshot, type LevelingSpecs } from '@/utils/characterLeveling';

interface Spell {
    active: boolean;
    spellId: string;
    name: string;
    description: string;
    type: string;
    class: string[];
    level: number;
    higherLevels: string;
    castingTime: string;
    duration: string;
    range: string;
    components: string;
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
    campaignId?: string;
    characterId: string;
    spellClassName?: string;
    spellAbilityLabel?: string;
    spellCd?: number;
    spellAttackBonus?: number;
    levelingSpecs?: LevelingSpecs;
    currentLevel?: number;
    initialSpellNames?: Record<number, { name: string; spellId: string }[]>;
    initialSlotTotals?: Record<number, number>;
    initialSlotsExpended?: Record<number, number>;
}

export interface SheetMagiasHandle {
    getData: () => {
        spellNames: Record<number, { name: string; spellId: string }[]>;
        slotsExpended: Record<number, number>;
        slotTotals: Record<number, number>;
    };
}

const SheetMagias = forwardRef<SheetMagiasHandle, SheetMagiasProps>(function SheetMagias(
    {
        characterId,
        spellClassName = '',
        spellAbilityLabel = '',
        spellCd = 0,
        spellAttackBonus = 0,
        levelingSpecs,
        currentLevel,
        initialSpellNames,
        initialSlotTotals,
        initialSlotsExpended: initialSlotsExpendedProp,
    },
    ref
) {
    const { themeMode } = useContext(TableriseContext);
    const progressionSnapshot = levelingSpecs
        ? getLevelingSnapshot(levelingSpecs, currentLevel ?? 1)
        : null;

    const getActiveSlots = (spellLevel: number): number => {
        if (!levelingSpecs) return SPELLS_PER_LEVEL;
        if (spellLevel === 0) {
            return progressionSnapshot?.cantripsKnown ?? 0;
        }
        const slotCount = progressionSnapshot?.slotTotals[spellLevel] ?? 0;
        if (slotCount === 0) return 0;
        return levelingSpecs.spellsKnown.isValidToThisClass
            ? progressionSnapshot?.spellsKnown ?? slotCount
            : slotCount;
    };

    const getSlotTotal = (spellLevel: number): number => {
        if (levelingSpecs) {
            return progressionSnapshot?.slotTotals[spellLevel] ?? 0;
        }
        return initialSlotTotals?.[spellLevel] ?? 0;
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
            initialSpellNames ??
            (Object.fromEntries(
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => [
                    l,
                    Array(SPELLS_PER_LEVEL).fill({ name: '', spellId: '' }),
                ])
            ) as Record<number, { name: string; spellId: string }[]>)
    );
    const [detailSpell, setDetailSpell] = useState<Spell | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [slotsExpended, setSlotsExpended] = useState<Record<number, number>>(
        () =>
            initialSlotsExpendedProp ??
            Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => [l, 0]))
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

    const spellsKnownLimit = levelingSpecs?.spellsKnown?.isValidToThisClass
        ? progressionSnapshot?.spellsKnown ?? Infinity
        : Infinity;

    const totalFilledNonCantrip = [1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((sum, level) => {
        const active = getActiveSlots(level);
        return (
            sum + spellNames[level].slice(0, active).filter((e) => e.name !== '').length
        );
    }, 0);

    const filteredSpells = pickerSpells.filter((s) => {
        const matchesSearch = s.name.toLowerCase().includes(pickerSearch.toLowerCase());
        const matchesClass =
            !spellClassName ||
            s.class.some((c) => c.toLowerCase() === spellClassName.toLowerCase());
        return matchesSearch && matchesClass;
    });

    return (
        <>
            {/* Spellcasting header */}
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
                        placeholder="-"
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

            {/* Spell levels grid */}
            <div className="cs-spell-grid">
                {SPELL_LEVELS.map((sl) => (
                    <div key={sl.level} className="cs-spell-level-box">
                        <div className="cs-spell-level-header">
                            <div className="cs-spell-level-header-book">
                                {(() => {
                                    const activeSlots = getActiveSlots(sl.level);
                                    const filledSlots = spellNames[sl.level]
                                        .slice(0, activeSlots)
                                        .filter((e) => e.name !== '').length;
                                    const isGlobalCap =
                                        sl.level > 0 &&
                                        !!levelingSpecs?.spellsKnown?.isValidToThisClass;
                                    const bookDisabled =
                                        activeSlots === 0 ||
                                        (isGlobalCap
                                            ? totalFilledNonCantrip >= spellsKnownLimit
                                            : filledSlots >= activeSlots);
                                    return (
                                        <Image
                                            src={
                                                themeMode === 'dark' ? BookDark : Book.src
                                            }
                                            alt="search"
                                            width={32}
                                            height={32}
                                            className={`transition-opacity ${
                                                bookDisabled
                                                    ? 'opacity-30 pointer-events-none'
                                                    : 'cursor-pointer hover:opacity-70'
                                            }`}
                                            onClick={() =>
                                                !bookDisabled &&
                                                handleOpenPicker(sl.level)
                                            }
                                        />
                                    );
                                })()}
                                <div className="cs-spell-level-badge ml-2">
                                    {sl.level === 0 ? 'T' : sl.level}
                                </div>
                            </div>
                            {sl.slots && (
                                <div className="cs-spell-slots">
                                    <span>
                                        Espaços de Magia: {getSlotTotal(sl.level)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="cs-spell-list">
                            {Array.from({ length: SPELLS_PER_LEVEL }).map((_, idx) => {
                                const activeSlots = getActiveSlots(sl.level);
                                const inactive = idx >= activeSlots;
                                return (
                                    <div key={idx} className="cs-spell-row">
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
                                                x
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Spell picker modal */}
            {pickerLevel !== null && (
                <div className="cs-spell-picker-overlay">
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
                                x
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
                                    <LoadingDots label="Carregando magias" />
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
                                                    {spell.name}
                                                </span>
                                                <span className="cs-spell-accordion-chevron">
                                                    {isOpen ? '▲' : '▼'}
                                                </span>
                                            </button>

                                            {/* Body */}
                                            {isOpen && (
                                                <div className="cs-spell-accordion-body">
                                                    <p className="text-xs text-color-greyScale/700 leading-relaxed mb-3">
                                                        {spell.description}
                                                    </p>

                                                    <div className="cs-spell-accordion-fields">
                                                        <div className="cs-spell-accordion-field">
                                                            <span className="cs-spell-accordion-field-label">
                                                                Tipo
                                                            </span>
                                                            <span className="cs-spell-accordion-field-value">
                                                                {spell.type}
                                                            </span>
                                                        </div>
                                                        <div className="cs-spell-accordion-field">
                                                            <span className="cs-spell-accordion-field-label">
                                                                Tempo de Conjuração
                                                            </span>
                                                            <span className="cs-spell-accordion-field-value">
                                                                {spell.castingTime}
                                                            </span>
                                                        </div>
                                                        <div className="cs-spell-accordion-field">
                                                            <span className="cs-spell-accordion-field-label">
                                                                Duração
                                                            </span>
                                                            <span className="cs-spell-accordion-field-value">
                                                                {spell.duration}
                                                            </span>
                                                        </div>
                                                        <div className="cs-spell-accordion-field">
                                                            <span className="cs-spell-accordion-field-label">
                                                                Alcance
                                                            </span>
                                                            <span className="cs-spell-accordion-field-value">
                                                                {spell.range}
                                                            </span>
                                                        </div>
                                                        <div className="cs-spell-accordion-field">
                                                            <span className="cs-spell-accordion-field-label">
                                                                Componentes
                                                            </span>
                                                            <span className="cs-spell-accordion-field-value">
                                                                {spell.components}
                                                            </span>
                                                        </div>
                                                        {spell.higherLevels && (
                                                            <div className="cs-spell-accordion-field cs-spell-accordion-field--full">
                                                                <span className="cs-spell-accordion-field-label">
                                                                    Em Níveis Superiores
                                                                </span>
                                                                <span className="cs-spell-accordion-field-value">
                                                                    {spell.higherLevels}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="cs-spell-picker-choose-btn"
                                                        onClick={() =>
                                                            handleChooseSpell(
                                                                spell.name,
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

            {/* Spell detail modal */}
            {(detailSpell !== null || detailLoading) && (
                <div className="cs-spell-picker-overlay">
                    <div
                        className="cs-spell-picker-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="cs-spell-picker-header">
                            <h2 className="font-S-bold text-base">
                                {detailLoading ? (
                                    <LoadingDots label="Carregando detalhes da magia" />
                                ) : (
                                    detailSpell?.name
                                )}
                            </h2>
                            <button
                                type="button"
                                className="cs-spell-picker-close"
                                onClick={closeDetail}
                            >
                                x
                            </button>
                        </div>

                        <div className="cs-spell-picker-list">
                            {detailLoading && (
                                <p className="text-center text-sm py-8">
                                    <LoadingDots label="Carregando detalhes da magia" />
                                </p>
                            )}
                            {!detailLoading && detailSpell && (
                                <div className="cs-spell-accordion-body border-none px-0">
                                    <p className="text-xs leading-relaxed mb-3">
                                        {detailSpell.description}
                                    </p>
                                    <div className="cs-spell-accordion-fields">
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Tipo
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {detailSpell.type}
                                            </span>
                                        </div>
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Tempo de Conjuração
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {detailSpell.castingTime}
                                            </span>
                                        </div>
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Duração
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {detailSpell.duration}
                                            </span>
                                        </div>
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Alcance
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {detailSpell.range}
                                            </span>
                                        </div>
                                        <div className="cs-spell-accordion-field">
                                            <span className="cs-spell-accordion-field-label">
                                                Componentes
                                            </span>
                                            <span className="cs-spell-accordion-field-value">
                                                {detailSpell.components}
                                            </span>
                                        </div>
                                        {detailSpell.higherLevels && (
                                            <div className="cs-spell-accordion-field cs-spell-accordion-field--full">
                                                <span className="cs-spell-accordion-field-label">
                                                    Em Níveis Superiores
                                                </span>
                                                <span className="cs-spell-accordion-field-value">
                                                    {detailSpell.higherLevels}
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
});

export default SheetMagias;
