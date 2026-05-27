'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
    handleOtpAutoAdvance,
    handleOtpKeyDown,
    handleOtpPaste,
} from '@/utils/otpInputHelpers';
import {
    activateUserTwoFactor,
    confirmActivateTwoFactorAppCode,
    confirmActivateTwoFactorEmailCode,
    sendActivateTwoFactorEmailCode,
} from '@/server/users/activate-two-factor';
import type { DatabaseUserWithDetails } from '@/types/shared/entities';
import '@/components/profile/styles/ProfileTwoFactorActivationModal.css';

type ActivationStep = 'email-code' | 'qr-code' | 'authenticator-code';

type ProfileTwoFactorActivationModalProps = {
    user: DatabaseUserWithDetails;
    onRefreshUser: () => Promise<DatabaseUserWithDetails | null>;
    onCancel: () => void;
    onCompleted: () => void;
};

const EMAIL_CODE_LENGTH = 6;
const AUTH_CODE_LENGTH = 6;
const TIMER_CYCLE_MS = 60_000;

function buildDigits(length: number): string[] {
    return new Array(length).fill('');
}

function digitsAreComplete(digits: string[]): boolean {
    return digits.every((digit) => digit.trim() !== '');
}

export default function ProfileTwoFactorActivationModal({
    user,
    onRefreshUser,
    onCancel,
    onCompleted,
}: ProfileTwoFactorActivationModalProps): JSX.Element {
    const [step, setStep] = useState<ActivationStep>('email-code');
    const [emailDigits, setEmailDigits] = useState<string[]>(
        buildDigits(EMAIL_CODE_LENGTH)
    );
    const [authenticatorDigits, setAuthenticatorDigits] = useState<string[]>(
        buildDigits(AUTH_CODE_LENGTH)
    );
    const [emailCodeSending, setEmailCodeSending] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [qrCodeConfirmed, setQrCodeConfirmed] = useState(false);
    const [timerProgress, setTimerProgress] = useState(1);
    const [secondsLeft, setSecondsLeft] = useState(60);

    const emailCodeComplete = useMemo(
        () => digitsAreComplete(emailDigits),
        [emailDigits]
    );
    const authenticatorCodeComplete = useMemo(
        () => digitsAreComplete(authenticatorDigits),
        [authenticatorDigits]
    );

    useEffect(() => {
        let active = true;

        async function sendCode() {
            setEmailCodeSending(true);
            setError('');

            try {
                await sendActivateTwoFactorEmailCode(user.email);
            } catch (sendError: Error | any) {
                if (!active) return;
                setError(
                    sendError?.message ??
                        '*Não foi possível enviar o código de verificação.'
                );
            } finally {
                if (active) {
                    setEmailCodeSending(false);
                }
            }
        }

        if (step === 'email-code') {
            sendCode();
        }

        return () => {
            active = false;
        };
    }, [step, user.email]);

    useEffect(() => {
        if (step !== 'authenticator-code') {
            setTimerProgress(1);
            setSecondsLeft(60);
            return;
        }

        const startedAt = Date.now();

        const updateTimer = () => {
            const elapsed = (Date.now() - startedAt) % TIMER_CYCLE_MS;
            const remainingMs = TIMER_CYCLE_MS - elapsed;
            setTimerProgress(remainingMs / TIMER_CYCLE_MS);
            setSecondsLeft(Math.ceil(remainingMs / 1000));
        };

        updateTimer();
        const intervalId = window.setInterval(updateTimer, 250);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [step]);

    const updateDigits = (
        value: string,
        index: number,
        digits: string[],
        setDigits: (nextDigits: string[]) => void,
        pattern: 'alphanumeric' | 'numeric'
    ) => {
        const normalizedValue =
            pattern === 'numeric' ? value.replace(/\D/g, '') : value.toUpperCase();

        if (normalizedValue.length > 1) return;
        if (
            normalizedValue !== '' &&
            !(pattern === 'numeric'
                ? /^[0-9]$/.test(normalizedValue)
                : /^[A-Z0-9]$/.test(normalizedValue))
        ) {
            return;
        }

        const nextDigits = [...digits];
        nextDigits[index] = normalizedValue;
        setDigits(nextDigits);
    };

    const handlePaste = (
        clipboardEvent: React.ClipboardEvent<HTMLInputElement>,
        length: number,
        setDigits: (nextDigits: string[]) => void
    ) => {
        handleOtpPaste(clipboardEvent, length, (chars) => {
            setDigits(chars);
        });
    };

    const handleConfirmEmailCode = async () => {
        if (!emailCodeComplete) return;

        setSubmitting(true);
        setError('');

        try {
            await confirmActivateTwoFactorEmailCode(user.email, emailDigits.join(''));
            await activateUserTwoFactor(user.userId);
            const refreshedUser = await onRefreshUser();

            if (!refreshedUser?.twoFactorSecret?.qrcode) {
                throw new Error('*Não foi possível carregar o QR Code do autenticador.');
            }

            setQrCodeConfirmed(false);
            setStep('qr-code');
        } catch (confirmError: Error | any) {
            setError(
                confirmError?.message ?? '*Não foi possível validar o código informado.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleContinueFromQr = () => {
        if (!qrCodeConfirmed) return;
        setError('');
        setAuthenticatorDigits(buildDigits(AUTH_CODE_LENGTH));
        setStep('authenticator-code');
    };

    const handleFinalize = async () => {
        if (!authenticatorCodeComplete) return;

        setSubmitting(true);
        setError('');

        try {
            await confirmActivateTwoFactorAppCode(
                user.email,
                authenticatorDigits.join('')
            );
            await onRefreshUser();
            onCompleted();
        } catch (confirmError: Error | any) {
            setError(
                confirmError?.message ??
                    '*Não foi possível validar o código do autenticador.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="profile-2fa-modal-overlay">
            <div
                className="profile-2fa-modal-card"
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="profile-2fa-modal-title font-L-semibold">
                    Autenticação de dois fatores
                </h1>

                {step === 'email-code' && (
                    <>
                        <p className="profile-2fa-modal-description font-XS-regular">
                            Digite o código enviado para o seu e-mail para ativar a
                            Autenticação de dois fatores.
                        </p>

                        <div className="profile-2fa-modal-inputs">
                            {emailDigits.map((digit, index) => (
                                <input
                                    key={`email-${index}`}
                                    id={`profile-email-code-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    className="profile-2fa-modal-digit input-default-light font-XS-regular"
                                    onChange={(event) =>
                                        updateDigits(
                                            event.target.value,
                                            index,
                                            emailDigits,
                                            setEmailDigits,
                                            'alphanumeric'
                                        )
                                    }
                                    onKeyDown={(event) =>
                                        handleOtpKeyDown(
                                            event,
                                            index,
                                            'profile-email-code-',
                                            'alphanumeric'
                                        )
                                    }
                                    onInput={(event) =>
                                        handleOtpAutoAdvance(
                                            event,
                                            index,
                                            'profile-email-code-'
                                        )
                                    }
                                    onPaste={(event) =>
                                        handlePaste(
                                            event,
                                            EMAIL_CODE_LENGTH,
                                            setEmailDigits
                                        )
                                    }
                                />
                            ))}
                        </div>
                    </>
                )}

                {step === 'qr-code' && (
                    <>
                        <p className="profile-2fa-modal-description font-XS-regular">
                            Escaneie o QR Code com seu aplicativo de Autenticação
                            preferido para continuar.
                        </p>

                        <div className="profile-2fa-qr-wrapper">
                            <Image
                                src={user.twoFactorSecret.qrcode}
                                alt="QR Code para ativação do autenticador"
                                width={220}
                                height={220}
                                unoptimized
                            />
                        </div>

                        <label className="profile-2fa-checkbox-row">
                            <input
                                type="checkbox"
                                checked={qrCodeConfirmed}
                                onChange={(event) =>
                                    setQrCodeConfirmed(event.target.checked)
                                }
                            />
                            <span className="font-XS-regular">
                                Já realizei o scan do QR Code
                            </span>
                        </label>
                    </>
                )}

                {step === 'authenticator-code' && (
                    <>
                        <div className="profile-2fa-timer-block">
                            <div className="profile-2fa-timer-bar">
                                <div
                                    className="profile-2fa-timer-bar-fill"
                                    style={{ transform: `scaleX(${timerProgress})` }}
                                />
                            </div>
                            <span className="font-XXS-regular profile-2fa-timer-text">
                                {secondsLeft}s
                            </span>
                        </div>

                        <p className="profile-2fa-modal-description font-XS-regular">
                            Digite o código encontrado no seu aplicativo autenticador.
                        </p>

                        <div className="profile-2fa-modal-inputs">
                            {authenticatorDigits.map((digit, index) => (
                                <input
                                    key={`auth-${index}`}
                                    id={`profile-auth-code-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    className="profile-2fa-modal-digit input-default-light font-XS-regular"
                                    onChange={(event) =>
                                        updateDigits(
                                            event.target.value,
                                            index,
                                            authenticatorDigits,
                                            setAuthenticatorDigits,
                                            'numeric'
                                        )
                                    }
                                    onKeyDown={(event) =>
                                        handleOtpKeyDown(
                                            event,
                                            index,
                                            'profile-auth-code-',
                                            'numeric'
                                        )
                                    }
                                    onInput={(event) =>
                                        handleOtpAutoAdvance(
                                            event,
                                            index,
                                            'profile-auth-code-'
                                        )
                                    }
                                    onPaste={(event) =>
                                        handlePaste(
                                            event,
                                            AUTH_CODE_LENGTH,
                                            setAuthenticatorDigits
                                        )
                                    }
                                />
                            ))}
                        </div>
                    </>
                )}

                {error && (
                    <span className="font-XXS-regular profile-2fa-modal-error">
                        {error}
                    </span>
                )}

                {step === 'email-code' && (
                    <div className="profile-2fa-modal-buttons">
                        <button
                            type="button"
                            disabled={
                                !emailCodeComplete || submitting || emailCodeSending
                            }
                            onClick={handleConfirmEmailCode}
                            className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                        >
                            {submitting ? 'Confirmando...' : 'Confirmar'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={submitting}
                            className="font-S-bold form-button-cancel button-L-fill w-full"
                        >
                            Cancelar
                        </button>
                    </div>
                )}

                {step === 'qr-code' && (
                    <div className="profile-2fa-modal-buttons">
                        <button
                            type="button"
                            disabled={!qrCodeConfirmed}
                            onClick={handleContinueFromQr}
                            className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                        >
                            Continuar
                        </button>
                    </div>
                )}

                {step === 'authenticator-code' && (
                    <div className="profile-2fa-modal-buttons">
                        <button
                            type="button"
                            disabled={!authenticatorCodeComplete || submitting}
                            onClick={handleFinalize}
                            className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                        >
                            {submitting ? 'Finalizando...' : 'Finalizar'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
