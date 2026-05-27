'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getUser } from '@/server/users/get-user';
import supportSchema, {
    supportReasonOptions,
    supportReasonsWithCampaignCode,
    type SupportFormPayload,
} from '@/components/support/schema/SupportSchema';

type SupportFormProps = {
    publicKey: string;
    serviceId: string;
    templateId: string;
};

type StoredUser = {
    userId?: string;
    nickname?: string;
    username?: string;
    email?: string;
};

function extractUserEmail(userData: any): string {
    return (
        userData?.email ??
        userData?.details?.email ??
        userData?.result?.email ??
        userData?.result?.details?.email ??
        ''
    );
}

function extractUserName(userData: any): string {
    return userData?.nickname ?? userData?.username ?? userData?.name ?? '';
}

export default function SupportForm({
    publicKey,
    serviceId,
    templateId,
}: SupportFormProps): JSX.Element {
    const formRef = useRef<HTMLFormElement>(null);
    const [resolvedEmail, setResolvedEmail] = useState('');
    const [accountError, setAccountError] = useState('');
    const [emailJsReady, setEmailJsReady] = useState(false);
    const [senderLoading, setSenderLoading] = useState(true);
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
        getValues,
        watch,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<SupportFormPayload>({
        resolver: zodResolver(supportSchema),
        defaultValues: {
            reason: undefined,
            campaignCode: '',
            name: '',
            requestMessage: '',
        },
    });

    const reason = watch('reason');
    const campaignCode = watch('campaignCode');
    const requestMessage = watch('requestMessage');
    const requiresCampaignCode = supportReasonsWithCampaignCode.includes(
        reason as (typeof supportReasonsWithCampaignCode)[number]
    );
    const compiledMessage = useMemo(() => {
        const safeReason = reason ?? '';
        const safeCampaignCode = campaignCode?.trim() ?? '';
        const safeMessage = requestMessage ?? '';

        if (!safeReason && !safeCampaignCode && !safeMessage) return '';

        if (requiresCampaignCode) {
            return `Motivo do contato: ${safeReason}\n\nCódigo da campanha do Jogador: ${safeCampaignCode}\n----------------------------------------\n${safeMessage}`;
        }

        return `Motivo do contato: ${safeReason}\n\nSolicitação:\n${safeMessage}`;
    }, [campaignCode, reason, requestMessage, requiresCampaignCode]);

    useEffect(() => {
        if (!requiresCampaignCode) {
            clearErrors('campaignCode');
        }
    }, [clearErrors, requiresCampaignCode]);

    useEffect(() => {
        async function resolveSender() {
            setSenderLoading(true);
            setAccountError('');

            try {
                const storedUserRaw = localStorage.getItem('userLogged');
                const storedUser: StoredUser | null = storedUserRaw
                    ? JSON.parse(storedUserRaw)
                    : null;

                if (!storedUser) {
                    setAccountError('Faça login para enviar uma solicitação de suporte.');
                    return;
                }

                const localName = storedUser.nickname ?? storedUser.username ?? '';

                if (localName && !getValues('name')) {
                    setValue('name', localName);
                }

                if (storedUser.email) {
                    setResolvedEmail(storedUser.email);
                    return;
                }

                if (!storedUser.userId) {
                    setAccountError(
                        'Não foi possível identificar o e-mail da sua conta para enviar a solicitação.'
                    );
                    return;
                }

                const userData = await getUser(storedUser.userId);
                const email = extractUserEmail(userData);
                const fetchedName = extractUserName(userData);

                if (!email) {
                    setAccountError(
                        'Não foi possível identificar o e-mail da sua conta para enviar a solicitação.'
                    );
                    return;
                }

                if (fetchedName && !getValues('name')) {
                    setValue('name', fetchedName);
                }

                setResolvedEmail(email);
                localStorage.setItem(
                    'userLogged',
                    JSON.stringify({
                        ...storedUser,
                        email,
                        nickname: storedUser.nickname ?? fetchedName,
                    })
                );
            } catch {
                setAccountError(
                    'Não foi possível carregar os dados da sua conta no momento. Tente novamente em instantes.'
                );
            } finally {
                setSenderLoading(false);
            }
        }

        resolveSender();
    }, [getValues, setValue]);

    function initializeEmailJs() {
        if (!publicKey || !window.emailjs) return;

        window.emailjs.init(publicKey);
        setEmailJsReady(true);
    }

    async function onSubmit(values: SupportFormPayload) {
        setStatusMessage(null);
        clearErrors('root');

        if (!publicKey || !serviceId || !templateId) {
            setError('root', {
                type: 'manual',
                message: 'A configuração do envio de suporte está incompleta no momento.',
            });
            return;
        }

        if (!resolvedEmail) {
            setError('root', {
                type: 'manual',
                message:
                    'Não foi possível identificar o e-mail da sua conta para enviar a solicitação.',
            });
            return;
        }

        if (!emailJsReady || !window.emailjs || !formRef.current) {
            setError('root', {
                type: 'manual',
                message:
                    'O serviço de envio ainda está carregando. Tente novamente em instantes.',
            });
            return;
        }

        try {
            await window.emailjs.sendForm(serviceId, templateId, formRef.current);

            reset({
                reason: undefined,
                campaignCode: '',
                name: values.name,
                requestMessage: '',
            });
            setStatusMessage({
                type: 'success',
                message:
                    'Solicitação enviada com sucesso. Nossa equipe responderá em até 48 horas.',
            });
        } catch {
            setStatusMessage({
                type: 'error',
                message: 'Não foi possível enviar sua solicitação. Tente novamente.',
            });
        }
    }

    const submitDisabled =
        isSubmitting ||
        senderLoading ||
        !!accountError ||
        !resolvedEmail ||
        !emailJsReady ||
        !publicKey ||
        !serviceId ||
        !templateId;

    return (
        <>
            <Script
                src="https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js"
                strategy="afterInteractive"
                onReady={initializeEmailJs}
                onLoad={initializeEmailJs}
            />

            <form
                ref={formRef}
                className="support-form"
                onSubmit={handleSubmit(onSubmit)}
            >
                <input type="hidden" name="email" value={resolvedEmail} readOnly />
                <input type="hidden" name="message" value={compiledMessage} readOnly />

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
                        {...register('reason')}
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

                <div className="support-form-field">
                    <label
                        htmlFor="support-name"
                        className="font-S-bold text-color-greyScale/950"
                    >
                        Qual seu nome?
                    </label>
                    <input
                        id="support-name"
                        type="text"
                        placeholder="Digite o seu nome"
                        className={`input-default-light font-S-regular support-form-input${
                            errors.name ? ' input-error-light' : ''
                        }`}
                        {...register('name')}
                    />
                    {errors.name && (
                        <span className="font-XXS-regular text-color-support/alert">
                            {errors.name.message}
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
                        Carregando os dados da sua conta...
                    </span>
                )}

                {!publicKey || !serviceId || !templateId ? (
                    <span className="font-XXS-regular text-color-support/alert">
                        A configuração do envio de suporte está incompleta no momento.
                    </span>
                ) : null}

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
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                </button>
            </form>
        </>
    );
}
