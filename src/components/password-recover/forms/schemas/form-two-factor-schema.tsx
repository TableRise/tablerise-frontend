import { z } from 'zod';

export const twoFactorSchema = z
    .object({
        fild0: z.string(),
        fild1: z.string(),
        fild2: z.string(),
        fild3: z.string(),
        fild4: z.string(),
        fild5: z.string(),
    })
    .refine(
        (data) => {
            // Verifica se todos os campos não estão vazios ou nulos
            return Object.values(data).every(
                (value) => value !== null && value.trim() !== ''
            );
        },
        {
            message: 'Todos os campos devem ser preenchidos.',
            path: ['fild0'], // Define um erro global
        }
    );

export type TwoFactorSchema = z.infer<typeof twoFactorSchema>;
