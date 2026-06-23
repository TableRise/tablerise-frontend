import { z } from 'zod';

const profileCompletionFields = {
    firstName: z.string().min(2, { message: 'Nome deve ter no minimo 2 caracteres*' }),
    lastName: z
        .string()
        .min(2, { message: 'Sobrenome deve ter no minimo 2 caracteres*' }),
    birthday: z.string().min(1, { message: 'Data de nascimento e obrigatoria*' }),
    gender: z.enum(['male', 'female'], {
        message: 'Genero e obrigatorio*',
    }),
};

export const completeProfileUserSchema = z.object(profileCompletionFields);

const completeOAuthUserSchema = z.object({
    nickname: z
        .string()
        .min(3, { message: 'Nickname deve ter no minimo 3 caracteres*' })
        .max(30, { message: 'Nickname deve ter no maximo 30 caracteres*' }),
    ...profileCompletionFields,
});

export type CompleteOAuthUserPayload = z.infer<typeof completeOAuthUserSchema>;
export type CompleteProfileUserPayload = z.infer<typeof completeProfileUserSchema>;
export default completeOAuthUserSchema;
