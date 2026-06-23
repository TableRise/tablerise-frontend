'use client';

import { useMemo, useState } from 'react';
import {
    handleOtpAutoAdvance,
    handleOtpKeyDown,
    handleOtpPaste,
} from '@/utils/otpInputHelpers';
import {
    confirmDisableTwoFactorCode,
    deactivateUserTwoFactor,
} from '@/server/users/disable-two-factor';
import '@/components/profile/styles/ProfileActionModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

type ProfileTwoFactorDisableModalProps = {
    userId: string;
    email: string;
    onClose: () => void;
    onSaved: () => void | Promise<void>;
};

const CODE_LENGTH = 6;

function buildDigits(): string[] {
    return new Array(CODE_LENGTH).fill('');
}

export default function ProfileTwoFactorDisableModal({
    userId,
    email,
    onClose,
    onSaved,
}: ProfileTwoFactorDisableModalProps): JSX.Element {
    useBodyScrollLock();
    const [digits, setDigits] = useState<string[]>(buildDigits());
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isCodeComplete = useMemo(
        () => digits.every((digit) => digit.trim() !== ''),
        [digits]
    );

    const handleDigitsChange = (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) return;

        const nextDigits = [...digits];
        nextDigits[index] = value;
        setDigits(nextDigits);
    };

    const handleConfirm = async () => {
        if (!isCodeComplete) return;

        setSubmitting(true);
        setError('');

        try {
            await confirmDisableTwoFactorCode(email, digits.join(''));
            await deactivateUserTwoFactor(userId);
            await onSaved();
        } catch (confirmError: Error | any) {
            setError(
                confirmError?.message ?? '*Não foi possivel desabilitar os dois fatores.'
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
                    Desabilitar dois fatores
                </h1>
                <p className="profile-action-modal-description font-XS-regular">
                    Digite o codigo do seu aplicativo autenticador para confirmar a
                    desativação da autenticação em dois fatores.
                </p>

                <div className="profile-action-modal-otp">
                    {digits.map((digit, index) => (
                        <input
                            key={`profile-disable-2fa-${index}`}
                            id={`profile-disable-2fa-${index}`}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
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
                                    'profile-disable-2fa-',
                                    'numeric'
                                )
                            }
                            onInput={(event) =>
                                handleOtpAutoAdvance(event, index, 'profile-disable-2fa-')
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
                        disabled={!isCodeComplete || submitting}
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
