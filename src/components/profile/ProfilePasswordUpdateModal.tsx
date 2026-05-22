'use client';

import { useEffect, useMemo, useState } from 'react';
import VisibilityOff from '@assets/icons/sys/visibility-off.svg';
import Visibility from '@assets/icons/sys/visibility.svg';
import {
    handleOtpAutoAdvance,
    handleOtpKeyDown,
    handleOtpPaste,
} from '@/utils/otpInputHelpers';
import {
    authenticate2fa,
    authenticateEmail,
    authenticateSecretQuestion,
    sendConfirmEmail,
    sendNewPassword,
} from '@/server/users/update-password';
import { newPasswordSchema } from '@/components/password-recover/forms/schemas/form-new-password-schema';
import '@/components/profile/styles/ProfileActionModal.css';

type ProfilePasswordUpdateModalProps = {
    email: string;
    onClose: () => void;
    onSaved: () => void | Promise<void>;
};

type Step = 'email-code' | 'secret-question' | 'two-factor' | 'new-password' | 'success';

const CODE_LENGTH = 6;

function buildDigits(): string[] {
    return new Array(CODE_LENGTH).fill('');
}

function getNextStep(accountSecurityMethod?: string): {
    nextStep: Exclude<Step, 'email-code' | 'success'>;
    secretQuestion: string;
} {
    if (!accountSecurityMethod) {
        return { nextStep: 'new-password', secretQuestion: '' };
    }

    if (accountSecurityMethod.startsWith('secret-question%')) {
        const [, question = ''] = accountSecurityMethod.split('%');
        return {
            nextStep: 'secret-question',
            secretQuestion: question,
        };
    }

    if (accountSecurityMethod === 'secret-question') {
        return {
            nextStep: 'secret-question',
            secretQuestion: '',
        };
    }

    if (accountSecurityMethod === 'two-factor') {
        return {
            nextStep: 'two-factor',
            secretQuestion: '',
        };
    }

    return {
        nextStep: 'new-password',
        secretQuestion: '',
    };
}

export default function ProfilePasswordUpdateModal({
    email,
    onClose,
    onSaved,
}: ProfilePasswordUpdateModalProps): JSX.Element {
    const [step, setStep] = useState<Step>('email-code');
    const [digits, setDigits] = useState<string[]>(buildDigits());
    const [secretQuestion, setSecretQuestion] = useState('');
    const [secretAnswer, setSecretAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isOtpStep = step === 'email-code' || step === 'two-factor';
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
                await sendConfirmEmail(email);
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

        if (step === 'email-code') {
            sendCode();
        }

        return () => {
            active = false;
        };
    }, [email, step]);

    const handleDigitsChange = (value: string, index: number) => {
        const pattern = step === 'two-factor' ? /^[0-9]?$/ : /^[A-Za-z0-9]?$/;

        if (!pattern.test(value)) return;

        const nextDigits = [...digits];
        nextDigits[index] = step === 'two-factor' ? value : value.toUpperCase();
        setDigits(nextDigits);
    };

    const handleConfirmEmailCode = async () => {
        if (!isCodeComplete) return;

        setSubmitting(true);
        setError('');

        try {
            const { accountSecurityMethod } = await authenticateEmail(
                email,
                digits.join('')
            );
            const { nextStep, secretQuestion: nextSecretQuestion } =
                getNextStep(accountSecurityMethod);

            setSecretQuestion(nextSecretQuestion);
            setDigits(buildDigits());
            setStep(nextStep);
        } catch (submitError: Error | any) {
            setError(
                submitError?.message ?? '*Nao foi possivel validar o codigo informado.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmSecretQuestion = async () => {
        const trimmedAnswer = secretAnswer.trim();

        if (!trimmedAnswer) {
            setError('*Digite a resposta da pergunta secreta.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await authenticateSecretQuestion(email, secretQuestion, trimmedAnswer);
            setStep('new-password');
        } catch (submitError: Error | any) {
            setError(
                submitError?.message ?? '*Nao foi possivel validar a resposta informada.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmTwoFactor = async () => {
        if (!isCodeComplete) return;

        setSubmitting(true);
        setError('');

        try {
            await authenticate2fa(email, digits.join(''));
            setDigits(buildDigits());
            setStep('new-password');
        } catch (submitError: Error | any) {
            setError(submitError?.message ?? '*Nao foi possivel validar o codigo 2FA.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmPassword = async () => {
        const validationResult = newPasswordSchema.safeParse({
            newPassword,
            confirmPassword,
        });

        if (!validationResult.success) {
            setError(validationResult.error.issues[0]?.message ?? '*Senha invalida.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await sendNewPassword(email, newPassword);
            setStep('success');
        } catch (submitError: Error | any) {
            setError(submitError?.message ?? '*Nao foi possivel atualizar a senha.');
        } finally {
            setSubmitting(false);
        }
    };

    const secretQuestionLabel = secretQuestion
        ? `${secretQuestion.charAt(0).toUpperCase()}${secretQuestion.slice(1)}`
        : 'Pergunta secreta';

    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card"
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="profile-action-modal-title font-L-semibold">
                    Atualizar senha
                </h1>

                {step === 'email-code' ? (
                    <>
                        <p className="profile-action-modal-description font-XS-regular">
                            Digite o codigo enviado para o seu e-mail atual para continuar
                            a atualizacao da senha.
                        </p>

                        <div className="profile-action-modal-otp">
                            {digits.map((digit, index) => (
                                <input
                                    key={`profile-password-email-code-${index}`}
                                    id={`profile-password-email-code-${index}`}
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
                                            'profile-password-email-code-',
                                            'alphanumeric'
                                        )
                                    }
                                    onInput={(event) =>
                                        handleOtpAutoAdvance(
                                            event,
                                            index,
                                            'profile-password-email-code-'
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
                ) : null}

                {step === 'secret-question' ? (
                    <div className="profile-action-modal-form">
                        <p className="profile-action-modal-description font-XS-regular">
                            Responda corretamente a sua pergunta secreta para seguir com a
                            atualizacao.
                        </p>
                        <label className="profile-action-modal-field">
                            <span className="font-S-bold profile-action-modal-label">
                                {secretQuestionLabel}
                            </span>
                            <input
                                type="text"
                                value={secretAnswer}
                                onChange={(event) => setSecretAnswer(event.target.value)}
                                className={`profile-action-modal-input font-S-regular ${
                                    error ? 'profile-action-modal-input--error' : ''
                                }`}
                                placeholder="Digite a sua resposta"
                            />
                        </label>
                    </div>
                ) : null}

                {step === 'two-factor' ? (
                    <>
                        <p className="profile-action-modal-description font-XS-regular">
                            Digite o codigo do seu aplicativo autenticador para continuar.
                        </p>

                        <div className="profile-action-modal-otp">
                            {digits.map((digit, index) => (
                                <input
                                    key={`profile-password-2fa-${index}`}
                                    id={`profile-password-2fa-${index}`}
                                    type="text"
                                    maxLength={1}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={digit}
                                    className="profile-action-modal-digit input-default-light font-XS-regular"
                                    onChange={(event) =>
                                        handleDigitsChange(event.target.value, index)
                                    }
                                    onKeyDown={(event) =>
                                        handleOtpKeyDown(
                                            event,
                                            index,
                                            'profile-password-2fa-',
                                            'numeric'
                                        )
                                    }
                                    onInput={(event) =>
                                        handleOtpAutoAdvance(
                                            event,
                                            index,
                                            'profile-password-2fa-'
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
                ) : null}

                {step === 'new-password' ? (
                    <div className="profile-action-modal-form">
                        <p className="profile-action-modal-description font-XS-regular">
                            Crie uma nova senha seguindo as mesmas regras de seguranca da
                            recuperacao de senha.
                        </p>
                        <label className="profile-action-modal-field">
                            <span className="font-S-bold profile-action-modal-label">
                                Nova senha
                            </span>
                            <div className="profile-action-modal-password-row">
                                <input
                                    type={newPasswordVisible ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(event.target.value)
                                    }
                                    className={`profile-action-modal-input font-S-regular ${
                                        error ? 'profile-action-modal-input--error' : ''
                                    }`}
                                    placeholder="Insira a sua nova senha"
                                />
                                <button
                                    type="button"
                                    className="profile-action-modal-password-toggle"
                                    onClick={() =>
                                        setNewPasswordVisible((current) => !current)
                                    }
                                    aria-label={
                                        newPasswordVisible
                                            ? 'Ocultar nova senha'
                                            : 'Mostrar nova senha'
                                    }
                                >
                                    {newPasswordVisible ? (
                                        <VisibilityOff />
                                    ) : (
                                        <Visibility />
                                    )}
                                </button>
                            </div>
                        </label>

                        <label className="profile-action-modal-field">
                            <span className="font-S-bold profile-action-modal-label">
                                Confirmar nova senha
                            </span>
                            <div className="profile-action-modal-password-row">
                                <input
                                    type={confirmPasswordVisible ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(event.target.value)
                                    }
                                    className={`profile-action-modal-input font-S-regular ${
                                        error ? 'profile-action-modal-input--error' : ''
                                    }`}
                                    placeholder="Confirme a nova senha"
                                />
                                <button
                                    type="button"
                                    className="profile-action-modal-password-toggle"
                                    onClick={() =>
                                        setConfirmPasswordVisible((current) => !current)
                                    }
                                    aria-label={
                                        confirmPasswordVisible
                                            ? 'Ocultar confirmacao de senha'
                                            : 'Mostrar confirmacao de senha'
                                    }
                                >
                                    {confirmPasswordVisible ? (
                                        <VisibilityOff />
                                    ) : (
                                        <Visibility />
                                    )}
                                </button>
                            </div>
                        </label>

                        <span className="font-XXS-regular profile-action-modal-helper">
                            Use entre 8 e 32 caracteres, incluindo pelo menos uma letra
                            maiuscula, um numero e um dos simbolos: !@#$&*
                        </span>
                    </div>
                ) : null}

                {step === 'success' ? (
                    <>
                        <p className="profile-action-modal-description font-XS-regular">
                            Sua senha foi atualizada com sucesso. Use a nova senha no
                            proximo acesso.
                        </p>
                        <div className="profile-action-modal-buttons">
                            <button
                                type="button"
                                onClick={() => {
                                    void onSaved();
                                }}
                                className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                            >
                                Fechar
                            </button>
                        </div>
                    </>
                ) : null}

                {error ? (
                    <span className="font-XXS-regular profile-action-modal-error">
                        {error}
                    </span>
                ) : null}

                {step !== 'success' ? (
                    <div className="profile-action-modal-buttons">
                        <button
                            type="button"
                            disabled={
                                (isOtpStep && (!isCodeComplete || sendingCode)) ||
                                submitting ||
                                !email.trim()
                            }
                            onClick={() => {
                                if (step === 'email-code') {
                                    void handleConfirmEmailCode();
                                    return;
                                }

                                if (step === 'secret-question') {
                                    void handleConfirmSecretQuestion();
                                    return;
                                }

                                if (step === 'two-factor') {
                                    void handleConfirmTwoFactor();
                                    return;
                                }

                                void handleConfirmPassword();
                            }}
                            className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                        >
                            {step === 'new-password'
                                ? submitting
                                    ? 'Atualizando...'
                                    : 'Confirmar'
                                : step === 'email-code'
                                ? submitting
                                    ? 'Continuando...'
                                    : 'Continuar'
                                : submitting
                                ? 'Confirmando...'
                                : 'Confirmar'}
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
                ) : null}
            </div>
        </div>
    );
}
