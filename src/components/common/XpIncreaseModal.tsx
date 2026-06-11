'use client';
import { useMemo, useState } from 'react';
import LoadingDots from '@/components/common/LoadingDots';
import '@/components/common/styles/XpIncreaseModal.css';
import { applyXpGain } from '@/utils/characterXp';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

const BASE_HP_BY_DICE_SIDES: Record<number, number> = { 6: 4, 8: 5, 10: 6, 12: 7 };

function parseDiceSides(hitDice: string): number {
    const m = String(hitDice ?? '')
        .trim()
        .match(/^(\d+)d(\d+)$/i);
    return m ? Number(m[2] ?? 0) : 0;
}

function rollHpGain(
    hitDice: string,
    levelsGained: number,
    constitutionModifier: number
): number {
    const m = String(hitDice ?? '')
        .trim()
        .match(/^(\d+)d(\d+)$/i);
    if (!m || levelsGained <= 0) return 0;
    const diceCount = Number(m[1] ?? 0);
    const diceSides = Number(m[2] ?? 0);
    if (diceCount <= 0 || diceSides <= 0) return 0;
    let total = 0;
    for (let li = 0; li < levelsGained; li++) {
        let roll = 0;
        for (let di = 0; di < diceCount; di++)
            roll += Math.floor(Math.random() * diceSides) + 1;
        total += roll + constitutionModifier;
    }
    return total;
}

interface XpIncreaseModalProps {
    currentXp: number;
    onClose: () => void;
    onConfirm: (addedXp: number, hpGain: number) => void | Promise<void>;
    submitting?: boolean;
    errorMessage?: string;
    hitDice?: string;
    constitutionModifier?: number;
    currentLevel?: number;
    xpSystemEnabled?: boolean;
}

export default function XpIncreaseModal({
    currentXp,
    onClose,
    onConfirm,
    submitting = false,
    errorMessage = '',
    hitDice = '',
    constitutionModifier = 0,
    currentLevel,
    xpSystemEnabled = true,
}: XpIncreaseModalProps): JSX.Element {
    useBodyScrollLock();
    const [xpToAddInput, setXpToAddInput] = useState('');
    const [hpMethod, setHpMethod] = useState<'roll' | 'base'>('roll');

    const parsedXpToAdd = Number(xpToAddInput);
    const isValidXpToAdd =
        xpToAddInput.trim() !== '' &&
        Number.isFinite(parsedXpToAdd) &&
        Number.isInteger(parsedXpToAdd) &&
        parsedXpToAdd >= 0;

    const nextProgression = useMemo(() => {
        if (!xpSystemEnabled) {
            return {
                xp: currentXp + (isValidXpToAdd ? parsedXpToAdd : 0),
                level: currentLevel ?? 1,
            };
        }

        return applyXpGain(currentXp, isValidXpToAdd ? parsedXpToAdd : 0);
    }, [currentLevel, currentXp, isValidXpToAdd, parsedXpToAdd, xpSystemEnabled]);

    const levelsGained =
        currentLevel !== undefined
            ? Math.max(0, nextProgression.level - currentLevel)
            : 0;
    const showHpSection = xpSystemEnabled && levelsGained > 0 && !!hitDice;
    const diceSides = showHpSection ? parseDiceSides(hitDice) : 0;
    const baseHpPerLevel = BASE_HP_BY_DICE_SIDES[diceSides] ?? 0;
    const baseHpGainPreview = (baseHpPerLevel + constitutionModifier) * levelsGained;

    const handleConfirm = () => {
        const hpGain = showHpSection
            ? hpMethod === 'base'
                ? baseHpGainPreview
                : rollHpGain(hitDice, levelsGained, constitutionModifier)
            : 0;
        void onConfirm(parsedXpToAdd, hpGain);
    };

    return (
        <div className="xpm-overlay">
            <div className="xpm-modal" onClick={(event) => event.stopPropagation()}>
                <div className="xpm-header">
                    <h2 className="font-L-semibold xpm-title">{'Aumentar XP'}</h2>
                    <button
                        type="button"
                        className="xpm-close font-M-semibold"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        &times;
                    </button>
                </div>

                <label className="xpm-field">
                    <span className="font-XS-bold xpm-label">
                        {'Quantidade de XP a adicionar'}
                    </span>
                    <input
                        className="xpm-input font-S-regular"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={xpToAddInput}
                        onChange={(event) => setXpToAddInput(event.target.value)}
                        disabled={submitting}
                    />
                </label>

                <div className="xpm-summary">
                    <div className="xpm-summary-row">
                        <span className="font-XS-regular xpm-summary-label">
                            {'XP atual'}
                        </span>
                        <span className="font-S-bold">{currentXp}</span>
                    </div>
                    <div className="xpm-summary-row">
                        <span className="font-XS-regular xpm-summary-label">
                            {'XP adicionado'}
                        </span>
                        <span className="font-S-bold">
                            {isValidXpToAdd ? parsedXpToAdd : 0}
                        </span>
                    </div>
                    <div className="xpm-summary-row">
                        <span className="font-XS-regular xpm-summary-label">
                            {'XP resultante'}
                        </span>
                        <span className="font-S-bold">{nextProgression.xp}</span>
                    </div>
                    {xpSystemEnabled && (
                        <div className="xpm-summary-row">
                            <span className="font-XS-regular xpm-summary-label">
                                {'N\u00edvel calculado'}
                            </span>
                            <span className="font-S-bold">{nextProgression.level}</span>
                        </div>
                    )}
                </div>

                {showHpSection && (
                    <div className="xpm-hp-section">
                        <span className="font-XS-bold xpm-label">
                            {'Ganho de HP por nível'}
                        </span>
                        <div className="xpm-hp-options">
                            <label className="xpm-hp-option">
                                <input
                                    type="radio"
                                    name="hpMethod"
                                    value="roll"
                                    checked={hpMethod === 'roll'}
                                    onChange={() => setHpMethod('roll')}
                                    disabled={submitting}
                                />
                                <span className="font-XS-regular">
                                    {`Rolar dado (${hitDice})`}
                                </span>
                            </label>
                            <label className="xpm-hp-option">
                                <input
                                    type="radio"
                                    name="hpMethod"
                                    value="base"
                                    checked={hpMethod === 'base'}
                                    onChange={() => setHpMethod('base')}
                                    disabled={submitting}
                                />
                                <span className="font-XS-regular">
                                    {`Usar valor base (${baseHpPerLevel} + ${constitutionModifier} mod) × ${levelsGained} = ${baseHpGainPreview}`}
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {!isValidXpToAdd && xpToAddInput.trim() !== '' && (
                    <span className="font-XXS-regular xpm-error">
                        {'Insira um valor inteiro maior ou igual a zero.'}
                    </span>
                )}

                {errorMessage && (
                    <span className="font-XXS-regular xpm-error">{errorMessage}</span>
                )}

                <div className="xpm-actions">
                    <button
                        type="button"
                        className="xpm-cancel font-S-bold"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        {'Cancelar'}
                    </button>
                    <button
                        type="button"
                        className="button-L-fill font-S-bold bg-color-primary/default_900 text-color-greyScale/50"
                        disabled={!isValidXpToAdd || submitting}
                        onClick={handleConfirm}
                    >
                        {submitting ? (
                            <LoadingDots label="Salvando experiência" />
                        ) : (
                            'Confirmar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
