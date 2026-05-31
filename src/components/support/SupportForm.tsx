'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingDots from '@/components/common/LoadingDots';
import { postSupport } from '@/server/users/post-support';
import supportSchema, {
    supportReasonOptions,
    supportReasonsWithCampaignCode,
    type SupportFormPayload,
} from '@/components/support/schema/SupportSchema';

type StoredUser = {
    userId?: string;
};

export default function SupportForm(): JSX.Element {
    const [resolvedUserId, setResolvedUserId] = useState('');
    const [accountError, setAccountError] = useState('');
    const [senderLoading, setSenderLoading] = useState(true);
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [statusMessage, setStatusMessage] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        setValue,
        watch,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<SupportFormPayload>({
        resolver: zodResolver(supportSchema),
        defaultValues: {
            reason: undefined,
            campaignCode: '',
            requestMessage: '',
        },
    });

    const requiresCampaignCode = supportReasonsWithCampaignCode.includes(
        selectedReason as (typeof supportReasonsWithCampaignCode)[number]
    );

    useEffect(() => {
        if (!requiresCampaignCode) {
            clearErrors('campaignCode');
            setValue('campaignCode', '');
        }
    }, [clearErrors, requiresCampaignCode, setValue]);

    useEffect(() => {
        function resolveSender() {
            setSenderLoading(true);
            setAccountError('');
            setResolvedUserId('');

            try {
                const storedUserRaw = localStorage.getItem('userLogged');
                const storedUser: StoredUser | null = storedUserRaw
                    ? JSON.parse(storedUserRaw)
                    : null;

                if (!storedUser) {
                    setAccountError('Faça login para enviar uma solicitação de suporte.');
                    return;
                }

                if (!storedUser.userId) {
                    setAccountError(
                        'Não foi possível identificar a sua conta para enviar a solicitação.'
                    );
                    return;
                }

                setResolvedUserId(storedUser.userId);
            } catch {
                setAccountError(
                    'Não foi possível carregar os dados da sua conta no momento. Tente novamente em instantes.'
                );
            } finally {
                setSenderLoading(false);
            }
        }

        resolveSender();
    }, []);

    async function onSubmit(values: SupportFormPayload) {
        setStatusMessage(null);
        clearErrors('root');

        if (!resolvedUserId) {
            setError('root', {
                type: 'manual',
                message:
                    'Não foi possível identificar a sua conta para enviar a solicitação.',
            });
            return;
        }

        try {
            const campaignCode = values.campaignCode?.trim();

            await postSupport(resolvedUserId, {
                title: `[SUPPORT] ${values.reason}`,
                content: values.requestMessage.trim(),
                category: values.reason,
                ...(campaignCode ? { campaignCode } : {}),
            });

            reset({
                reason: undefined,
                campaignCode: '',
                requestMessage: '',
            });
            setSelectedReason('');
            setStatusMessage({
                type: 'success',
                message:
                    'Solicitação enviada com sucesso. Nossa equipe responderá em até 48 horas.',
            });
        } catch (error) {
            setStatusMessage({
                type: 'error',
                message:
                    error instanceof Error
                        ? error.message.replace(/^\*/, '')
                        : 'Não foi possível enviar sua solicitação. Tente novamente.',
            });
        }
    }

    const submitDisabled =
        isSubmitting || senderLoading || !!accountError || !resolvedUserId;

    return (
        <form className="support-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="support-form-field">
                <label
                    htmlFor="support-reason"
                    className="font-S-bold text-color-greyScale/950"
                >
                    Qual o motivo do contato?
                </label>
                <select
                    id="support-reason"
                    className={`support-form-select input-default-light font-S-regular${
                        errors.reason ? ' support-form-select--error' : ''
                    }`}
                    defaultValue=""
                    {...register('reason', {
                        onChange: (event) => setSelectedReason(event.target.value),
                    })}
                >
                    <option value="" disabled>
                        Selecione uma opção
                    </option>
                    {supportReasonOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                {errors.reason && (
                    <span className="font-XXS-regular text-color-support/alert">
                        {errors.reason.message}
                    </span>
                )}
            </div>

            {requiresCampaignCode && (
                <div className="support-form-field">
                    <label
                        htmlFor="support-campaign-code"
                        className="font-S-bold text-color-greyScale/950"
                    >
                        Código da campanha
                    </label>
                    <input
                        id="support-campaign-code"
                        type="text"
                        placeholder="Digite o código da campanha"
                        className={`input-default-light font-S-regular support-form-input${
                            errors.campaignCode ? ' input-error-light' : ''
                        }`}
                        {...register('campaignCode')}
                    />
                    {errors.campaignCode && (
                        <span className="font-XXS-regular text-color-support/alert">
                            {errors.campaignCode.message}
                        </span>
                    )}
                </div>
            )}

            <div className="support-form-field">
                <label
                    htmlFor="support-request-message"
                    className="font-S-bold text-color-greyScale/950"
                >
                    Digite aqui sua solicitação:
                </label>
                <textarea
                    id="support-request-message"
                    rows={8}
                    placeholder="Descreva como podemos ajudar"
                    className={`support-form-textarea font-S-regular${
                        errors.requestMessage ? ' support-form-textarea--error' : ''
                    }`}
                    {...register('requestMessage')}
                />
                {errors.requestMessage && (
                    <span className="font-XXS-regular text-color-support/alert">
                        {errors.requestMessage.message}
                    </span>
                )}
            </div>

            {senderLoading && (
                <span className="font-XXS-regular text-color-greyScale/500">
                    <LoadingDots label="Carregando os dados da sua conta" />
                </span>
            )}

            {accountError && (
                <span className="font-XXS-regular text-color-support/alert">
                    {accountError}
                </span>
            )}

            {errors.root && (
                <span className="font-XXS-regular text-color-support/alert">
                    {errors.root.message}
                </span>
            )}

            {statusMessage && (
                <span
                    className={`font-XXS-regular ${
                        statusMessage.type === 'success'
                            ? 'text-color-support/success'
                            : 'text-color-support/alert'
                    }`}
                >
                    {statusMessage.message}
                </span>
            )}

            <button
                type="submit"
                className="button-L-fill support-form-submit text-color-greyScale/50"
                disabled={submitDisabled}
            >
                {isSubmitting ? <LoadingDots label="Enviando suporte" /> : 'Enviar'}
            </button>
        </form>
    );
}
