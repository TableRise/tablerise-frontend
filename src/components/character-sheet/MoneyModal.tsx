'use client';
import { useState } from 'react';
import '@/components/character-sheet/styles/MoneyModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

interface MoneyModalProps {
    currencyLabel: string;
    currentAmount: number;
    onConfirm: (delta: number) => void;
    onClose: () => void;
}

export default function MoneyModal({
    currencyLabel,
    currentAmount,
    onConfirm,
    onClose,
}: MoneyModalProps): JSX.Element {
    useBodyScrollLock();
    const [operation, setOperation] = useState<'add' | 'subtract'>('add');
    const [amountInput, setAmountInput] = useState('');

    const parsed = Number(amountInput);
    const isValid =
        amountInput.trim() !== '' &&
        Number.isFinite(parsed) &&
        Number.isInteger(parsed) &&
        parsed > 0;

    const delta = isValid ? (operation === 'add' ? parsed : -parsed) : 0;
    const resultAmount = Math.max(0, currentAmount + delta);

    const handleConfirm = () => {
        if (!isValid) return;
        onConfirm(delta);
    };

    return (
        <div className="mmm-overlay">
            <div className="mmm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="mmm-header">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-M-semibold mmm-title">
                            Adicionar/Subtrair Dinheiro
                        </h2>
                        <span className="font-XS-regular text-color-greyScale/500">
                            Moeda: {currencyLabel}
                        </span>
                    </div>
                    <button
                        type="button"
                        className="mmm-close font-M-semibold"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>

                <div className="mmm-operation-row">
                    <button
                        type="button"
                        className={`mmm-op-btn ${
                            operation === 'add'
                                ? 'mmm-op-btn--active'
                                : 'mmm-op-btn--inactive'
                        }`}
                        onClick={() => setOperation('add')}
                    >
                        Adicionar
                    </button>
                    <button
                        type="button"
                        className={`mmm-op-btn ${
                            operation === 'subtract'
                                ? 'mmm-op-btn--active'
                                : 'mmm-op-btn--inactive'
                        }`}
                        onClick={() => setOperation('subtract')}
                    >
                        Subtrair
                    </button>
                </div>

                <label className="mmm-field">
                    <span className="font-XS-bold mmm-label">Quantidade</span>
                    <input
                        className="mmm-input font-S-regular"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="0"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                    />
                </label>

                <div className="mmm-summary">
                    <div className="mmm-summary-row">
                        <span className="font-XS-regular mmm-summary-label">Atual</span>
                        <span className="font-XS-bold">{currentAmount}</span>
                    </div>
                    <div className="mmm-summary-row">
                        <span className="font-XS-regular mmm-summary-label">
                            {operation === 'add' ? '+' : '-'}
                        </span>
                        <span className="font-XS-bold">{isValid ? parsed : 0}</span>
                    </div>
                    <div className="mmm-summary-row">
                        <span className="font-XS-regular mmm-summary-label">
                            Resultado
                        </span>
                        <span className="font-XS-bold">
                            {isValid ? resultAmount : currentAmount}
                        </span>
                    </div>
                </div>

                <div className="mmm-actions">
                    <button
                        type="button"
                        className="font-S-bold mmm-cancel"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="button-L-fill font-S-bold bg-color-primary/default_900 text-color-greyScale/50 px-6 py-2 rounded-xl disabled:opacity-40"
                        disabled={!isValid}
                        onClick={handleConfirm}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
