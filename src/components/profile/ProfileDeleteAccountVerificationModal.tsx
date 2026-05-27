'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    handleOtpAutoAdvance,
    handleOtpKeyDown,
    handleOtpPaste,
} from '@/utils/otpInputHelpers';
import {
    confirmDeleteUserEmailCode,
    sendDeleteUserEmailCode,
} from '@/server/users/delete-user-verification';
import '@/components/profile/styles/ProfileActionModal.css';

type ProfileDeleteAccountVerificationModalProps = {
    email: string;
    onClose: () => void;
    onVerified: () => void;
};

const CODE_LENGTH = 6;

function buildDigits(): string[] {
    return new Array(CODE_LENGTH).fill('');
}

export default function ProfileDeleteAccountVerificationModal({
    email,
    onClose,
    onVerified,
}: ProfileDeleteAccountVerificationModalProps): JSX.Element {
    const [digits, setDigits] = useState<string[]>(buildDigits());
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
            if (!email.trim()) {
                setError('*Nao foi possivel identificar o e-mail atual da conta.');
                return;
            }

            setSendingCode(true);
            setError('');

            try {
                await sendDeleteUserEmailCode(email);
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

        sendCode();

        return () => {
            active = false;
        };
    }, [email]);

    const handleDigitsChange = (value: string, index: number) => {
        if (!/^[A-Za-z0-9]?$/.test(value)) return;

        const nextDigits = [...digits];
        nextDigits[index] = value.toUpperCase();
        setDigits(nextDigits);
    };

    const handleConfirm = async () => {
        if (!isCodeComplete || !email.trim()) return;

        setSubmitting(true);
        setError('');

        try {
            await confirmDeleteUserEmailCode(email, digits.join(''));
            onVerified();
        } catch (submitError: Error | any) {
            setError(
                submitError?.message ?? '*Nao foi possivel validar o codigo informado.'
            );
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
                    Verificar e-mail
                </h1>
                <p className="profile-action-modal-description font-XS-regular">
                    Digite o codigo enviado para o seu e-mail para continuar com a
                    exclusao da conta.
                </p>

                <div className="profile-action-modal-otp">
                    {digits.map((digit, index) => (
                        <input
                            key={`profile-delete-user-code-${index}`}
                            id={`profile-delete-user-code-${index}`}
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
                                    'profile-delete-user-code-',
                                    'alphanumeric'
                                )
                            }
                            onInput={(event) =>
                                handleOtpAutoAdvance(
                                    event,
                                    index,
                                    'profile-delete-user-code-'
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

                {error ? (
                    <span className="font-XXS-regular profile-action-modal-error">
                        {error}
                    </span>
                ) : null}

                <div className="profile-action-modal-buttons">
                    <button
                        type="button"
                        disabled={!isCodeComplete || submitting || sendingCode}
                        onClick={() => {
                            void handleConfirm();
                        }}
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
            </div>
        </div>
    );
}
