'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    handleOtpAutoAdvance,
    handleOtpKeyDown,
    handleOtpPaste,
} from '@/utils/otpInputHelpers';
import {
    confirmUpdateEmailCode,
    sendUpdateEmailCode,
    updateUserEmail,
} from '@/server/users/update-email';
import '@/components/profile/styles/ProfileActionModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

type ProfileEmailUpdateModalProps = {
    userId: string;
    email: string;
    onClose: () => void;
    onSaved: () => void | Promise<void>;
};

type Step = 'code' | 'new-email';

const CODE_LENGTH = 6;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildDigits(): string[] {
    return new Array(CODE_LENGTH).fill('');
}

export default function ProfileEmailUpdateModal({
    userId,
    email,
    onClose,
    onSaved,
}: ProfileEmailUpdateModalProps): JSX.Element {
    useBodyScrollLock();
    const [step, setStep] = useState<Step>('code');
    const [digits, setDigits] = useState<string[]>(buildDigits());
    const [newEmail, setNewEmail] = useState('');
    const [sendingCode, setSendingCode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isCodeComplete = useMemo(
        () => digits.every((digit) => digit.trim() !== ''),
        [digits]
    );

    useEffect(() => {
        let active = true;

        async function sendCode() {
            setSendingCode(true);
            setError('');

            try {
                await sendUpdateEmailCode(email);
            } catch (sendError: Error | any) {
                if (!active) return;
                setError(
                    sendError?.message ??
                        '*Nao foi possivel enviar o codigo de verificacao.'
                );
            } finally {
                if (active) {
                    setSendingCode(false);
                }
            }
        }

        if (step === 'code') {
            sendCode();
        }

        return () => {
            active = false;
        };
    }, [email, step]);

    const handleDigitsChange = (value: string, index: number) => {
        if (!/^[A-Za-z0-9]?$/.test(value)) return;

        const nextDigits = [...digits];
        nextDigits[index] = value.toUpperCase();
        setDigits(nextDigits);
    };

    const handleConfirmCode = async () => {
        if (!isCodeComplete) return;

        setSubmitting(true);
        setError('');

        try {
            await confirmUpdateEmailCode(email, digits.join(''));
            setStep('new-email');
        } catch (submitError: Error | any) {
            setError(
                submitError?.message ?? '*Nao foi possivel validar o codigo informado.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmNewEmail = async () => {
        const trimmedEmail = newEmail.trim();

        if (!emailPattern.test(trimmedEmail)) {
            setError('*Digite um e-mail valido.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await updateUserEmail(userId, trimmedEmail);
            await onSaved();
        } catch (submitError: Error | any) {
            setError(submitError?.message ?? '*Nao foi possivel atualizar o e-mail.');
            setSubmitting(false);
        }
    };

    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card"
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="profile-action-modal-title font-L-semibold">
                    Atualizar email
                </h1>

                {step === 'code' ? (
                    <>
                        <p className="profile-action-modal-description font-XS-regular">
                            Digite o codigo enviado para o seu e-mail atual para continuar
                            a atualizacao.
                        </p>

                        <div className="profile-action-modal-otp">
                            {digits.map((digit, index) => (
                                <input
                                    key={`profile-email-update-${index}`}
                                    id={`profile-email-update-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    className="profile-action-modal-digit input-default-light font-XS-regular"
                                    onChange={(event) =>
                                        handleDigitsChange(event.target.value, index)
                                    }
                                    onKeyDown={(event) =>
                                        handleOtpKeyDown(
                                            event,
                                            index,
                                            'profile-email-update-',
                                            'alphanumeric'
                                        )
                                    }
                                    onInput={(event) =>
                                        handleOtpAutoAdvance(
                                            event,
                                            index,
                                            'profile-email-update-'
                                        )
                                    }
                                    onPaste={(event) =>
                                        handleOtpPaste(event, CODE_LENGTH, (chars) => {
                                            setDigits(chars);
                                        })
                                    }
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="profile-action-modal-form">
                        <label className="profile-action-modal-field">
                            <span className="font-S-bold profile-action-modal-label">
                                Novo email
                            </span>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(event) => setNewEmail(event.target.value)}
                                className={`font-S-regular mt-2 w-full ${
                                    error ? 'input-error-light' : 'input-default-light'
                                }`}
                                placeholder="novoemail@exemplo.com"
                            />
                        </label>
                    </div>
                )}

                {error ? (
                    <span className="font-XXS-regular profile-action-modal-error">
                        {error}
                    </span>
                ) : null}

                {step === 'code' ? (
                    <div className="profile-action-modal-buttons">
                        <button
                            type="button"
                            disabled={!isCodeComplete || submitting || sendingCode}
                            onClick={handleConfirmCode}
                            className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                        >
                            {submitting ? 'Confirmando...' : 'Confirmar'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="font-S-bold form-button-cancel button-L-fill w-full"
                        >
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <div className="profile-action-modal-buttons">
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={handleConfirmNewEmail}
                            className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                        >
                            {submitting ? 'Atualizando...' : 'Confirmar'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
