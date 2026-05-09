'use client';
import { useMemo, useState } from 'react';
import { applyXpGain } from '@/utils/characterXp';
import '@/components/common/styles/XpIncreaseModal.css';

interface XpIncreaseModalProps {
    currentXp: number;
    onClose: () => void;
    onConfirm: (addedXp: number) => void | Promise<void>;
    submitting?: boolean;
    errorMessage?: string;
}

export default function XpIncreaseModal({
    currentXp,
    onClose,
    onConfirm,
    submitting = false,
    errorMessage = '',
}: XpIncreaseModalProps): JSX.Element {
    const [xpToAddInput, setXpToAddInput] = useState('');

    const parsedXpToAdd = Number(xpToAddInput);
    const isValidXpToAdd =
        xpToAddInput.trim() !== '' &&
        Number.isFinite(parsedXpToAdd) &&
        Number.isInteger(parsedXpToAdd) &&
        parsedXpToAdd >= 0;

    const nextProgression = useMemo(
        () => applyXpGain(currentXp, isValidXpToAdd ? parsedXpToAdd : 0),
        [currentXp, isValidXpToAdd, parsedXpToAdd]
    );

    return (
        <div className="xpm-overlay" onClick={submitting ? undefined : onClose}>
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
                    <div className="xpm-summary-row">
                        <span className="font-XS-regular xpm-summary-label">
                            {'N\u00edvel calculado'}
                        </span>
                        <span className="font-S-bold">{nextProgression.level}</span>
                    </div>
                </div>

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
                        onClick={() => onConfirm(parsedXpToAdd)}
                    >
                        {submitting ? 'Salvando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
