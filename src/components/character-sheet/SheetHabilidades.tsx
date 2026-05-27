'use client';
import { forwardRef, useImperativeHandle, useState } from 'react';

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

interface SheetHabilidadesProps {
    campaignId?: string;
    characterId: string;
    spellClassName?: string;
    initialAbilityNames?: Record<number, string[]>;
    initialSlotsTotal?: Record<number, string>;
    initialSlotsExpended?: Record<number, number>;
}

export interface SheetHabilidadesHandle {
    getData: () => {
        abilityNames: Record<number, string[]>;
        abilityKey: string;
        saveDc: string;
        attackBonus: string;
        slotsTotal: Record<number, string>;
        slotsExpended: Record<number, number>;
    };
}

const SheetHabilidades = forwardRef<SheetHabilidadesHandle, SheetHabilidadesProps>(
    function SheetHabilidades(
        {
            spellClassName = '',
            initialAbilityNames,
            initialSlotsTotal: initialSlotsTotalProp,
            initialSlotsExpended: initialSlotsExpendedProp,
        },
        ref
    ) {
        const [abilityKey, setAbilityKey] = useState('N/A');
        const [saveDc, setSaveDc] = useState('0');
        const [attackBonus, setAttackBonus] = useState('+0');
        const [abilityNames, setAbilityNames] = useState<Record<number, string[]>>(
            () =>
                initialAbilityNames ??
                (Object.fromEntries(
                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => [
                        l,
                        Array(ABILITIES_PER_LEVEL).fill(''),
                    ])
                ) as Record<number, string[]>)
        );
        const [slotsTotal, setSlotsTotal] = useState<Record<number, string>>(
            () =>
                initialSlotsTotalProp ??
                Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => [l, '']))
        );
        const [slotsExpended, setSlotsExpended] = useState<Record<number, number>>(
            () =>
                initialSlotsExpendedProp ??
                Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => [l, 0]))
        );

        useImperativeHandle(ref, () => ({
            getData: () => ({
                abilityNames,
                abilityKey,
                saveDc,
                attackBonus,
                slotsTotal,
                slotsExpended: Object.fromEntries(
                    Object.entries(slotsExpended).map(([k, v]) => [k, Number(v)])
                ) as Record<number, number>,
            }),
        }));

        return (
            <>
                {/* ── Header ─────────────────────────────── */}
                <div className="cs-spell-header">
                    <div className="cs-spell-header-box">
                        <input
                            className="cs-field-input text-center cs-field-input--readonly bg-transparent"
                            value={spellClassName}
                            placeholder="Classe"
                            readOnly
                        />
                        <span className="cs-field-label">Classe</span>
                    </div>
                    <div className="cs-spell-header-box">
                        <input
                            className="cs-field-input text-center"
                            value={abilityKey}
                            placeholder="—"
                            onChange={(e) => setAbilityKey(e.target.value)}
                        />
                        <span className="cs-field-label">Habilidade-Chave</span>
                    </div>
                    <div className="cs-spell-header-box">
                        <input
                            className="cs-field-input text-center"
                            value={saveDc}
                            placeholder="0"
                            onChange={(e) => setSaveDc(e.target.value)}
                        />
                        <span className="cs-field-label">CD Resistência</span>
                    </div>
                    <div className="cs-spell-header-box">
                        <input
                            className="cs-field-input text-center"
                            value={attackBonus}
                            placeholder="+0"
                            onChange={(e) => setAttackBonus(e.target.value)}
                        />
                        <span className="cs-field-label">Bônus de Ataque</span>
                    </div>
                </div>

                {/* ── Grid ───────────────────────────────── */}
                <div className="cs-spell-grid">
                    {ABILITY_LEVELS.map((sl) => (
                        <div key={sl.level} className="cs-spell-level-box">
                            <div className="cs-spell-level-header">
                                <div className="cs-spell-level-badge">
                                    {sl.level === 0 ? 'T' : sl.level}
                                </div>
                                {sl.slots && (
                                    <div className="cs-spell-slots">
                                        <span>
                                            Espaços de Magia:{' '}
                                            <input
                                                className="cs-spell-slot-input"
                                                value={slotsTotal[sl.level] || ''}
                                                placeholder="0"
                                                onChange={(e) =>
                                                    setSlotsTotal((prev) => ({
                                                        ...prev,
                                                        [sl.level]: e.target.value,
                                                    }))
                                                }
                                            />
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="cs-spell-list">
                                {Array.from({ length: ABILITIES_PER_LEVEL }).map(
                                    (_, idx) => (
                                        <div key={idx} className="cs-spell-row">
                                            <input
                                                className="cs-spell-name-input"
                                                value={abilityNames[sl.level][idx]}
                                                onChange={(e) =>
                                                    setAbilityNames((prev) => {
                                                        const current = [
                                                            ...prev[sl.level],
                                                        ];
                                                        current[idx] = e.target.value;
                                                        return {
                                                            ...prev,
                                                            [sl.level]: current,
                                                        };
                                                    })
                                                }
                                                placeholder={
                                                    sl.level === 0
                                                        ? `Truque ${idx + 1}`
                                                        : `Habilidade ${idx + 1}`
                                                }
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    }
);

export default SheetHabilidades;
