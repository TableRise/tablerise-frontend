import { z } from 'zod';

export const emailSchema = z.object({
    email: z.string().email('Endereço de e-mail inválido'),
});

export type EmailSchema = z.infer<typeof emailSchema>;
