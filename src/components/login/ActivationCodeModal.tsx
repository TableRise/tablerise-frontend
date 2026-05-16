'use client';
import React, { useRef, useState } from 'react';
import { postAuthenticateEmail } from '@/server/users/authenticate-email';
import { handleOtpKeyDown, handleOtpPaste } from '@/utils/otpInputHelpers';
import './styles/ActivationCodeModal.css';

interface ActivationCodeModalProps {
    email: string;
    onClose: () => void;
}

export default function ActivationCodeModal({
    email,
    onClose,
}: ActivationCodeModalProps): JSX.Element {
    const LENGTH = 6;
    const [digits, setDigits] = useState<string[]>(new Array(LENGTH).fill(''));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const isComplete = digits.every((d) => d !== '');

    const handleChange = (value: string, index: number) => {
        if (!/^[a-zA-Z0-9]?$/.test(value)) return;

        const updated = [...digits];
        updated[index] = value.toUpperCase();
        setDigits(updated);

        if (value && index < LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        handleOtpKeyDown(e, index, '', 'alphanumeric');
        if (
            (e.key === 'Backspace' || e.key === 'Delete') &&
            digits[index] === '' &&
            index > 0
        ) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const onPasteFilled = (chars: string[]) => {
        setDigits(chars);
        const nextEmpty = chars.findIndex((d) => d === '');
        const focusIndex = nextEmpty === -1 ? LENGTH - 1 : nextEmpty;
        inputRefs.current[focusIndex]?.focus();
    };

    const handleConfirm = async () => {
        const code = digits.join('');
        setError('');
        setLoading(true);
        try {
            await postAuthenticateEmail(email, code);
            window.location.replace('/');
        } catch (err: Error | any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="activation-modal-overlay">
            <div className="activation-modal-card" onClick={(e) => e.stopPropagation()}>
                <h1 className="activation-modal-title font-L-semibold">
                    Ative sua conta
                </h1>
                <p className="activation-modal-description font-XS-regular">
                    Insira o código de ativação enviado para o seu e-mail.
                </p>

                <div className="activation-modal-inputs">
                    {digits.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            className="activation-modal-digit input-default-light font-XS-regular"
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={(e) => handleOtpPaste(e, LENGTH, onPasteFilled)}
                        />
                    ))}
                </div>

                <div className="activation-modal-buttons">
                    <button
                        type="button"
                        disabled={!isComplete || loading}
                        onClick={handleConfirm}
                        className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                    >
                        Confirmar
                    </button>
                    {error && (
                        <span className="font-XXS-regular text-color-support/alert">
                            {error}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="font-S-bold form-button-cancel button-L-ghost"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
