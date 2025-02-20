import regexCollection from '@/utils/regexCollection';
import { z } from 'zod';

export const newPasswordSchema = z
    .object({
        newPassword: z.string().regex(regexCollection.regexForPasswordValidation, {
            message:
                'Use entre 8 e 32 caracteres, incluindo pelo menos uma letra maiúscula, um número e um dos símbolos: !@#$&*',
        }),
        confirmPassword: z.string().min(1, { message: 'O campo não pode estar vazio*' }),
    })
    .refine((data) => data.confirmPassword === data.newPassword, {
        message: 'Esses campos não coincidem*',
        path: ['confirmPassword'], // Define o campo onde o erro será exibido
    });

export type NewPasswordSchema = z.infer<typeof newPasswordSchema>;
