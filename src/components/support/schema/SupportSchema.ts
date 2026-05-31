import { z } from 'zod';

export const supportReasonOptions = [
    'Suporte técnico',
    'Reportar um bug',
    'Dar uma sugestão',
    'Tirar uma dúvida',
] as const;

export const supportReasonsWithCampaignCode = [
    'Suporte técnico',
    'Reportar um bug',
] as const;

const supportSchema = z
    .object({
        reason: z.enum(supportReasonOptions, {
            message: 'Selecione o motivo do contato*',
        }),
        campaignCode: z
            .string()
            .trim()
            .max(120, { message: 'Código da campanha muito longo*' })
            .optional(),
        requestMessage: z
            .string()
            .trim()
            .min(1, { message: 'Digite a sua solicitação*' })
            .max(4000, { message: 'Solicitação muito longa*' }),
    })
    .superRefine((value, ctx) => {
        if (
            supportReasonsWithCampaignCode.includes(
                value.reason as (typeof supportReasonsWithCampaignCode)[number]
            ) &&
            !value.campaignCode?.trim()
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['campaignCode'],
                message: 'Informe o código da campanha*',
            });
        }
    });

export type SupportFormPayload = z.infer<typeof supportSchema>;
export default supportSchema;
