import { z } from 'zod';

const profileCompletionFields = {
    firstName: z.string().min(2, { message: 'Nome deve ter no mÃ­nimo 2 caracteres*' }),
    lastName: z
        .string()
        .min(2, { message: 'Sobrenome deve ter no mÃ­nimo 2 caracteres*' }),
    birthday: z.string().min(1, { message: 'Data de nascimento é obrigatória*' }),
};

export const completeProfileUserSchema = z.object(profileCompletionFields);

const completeOAuthUserSchema = z.object({
    nickname: z
        .string()
        .min(3, { message: 'Nickname deve ter no mÃ­nimo 3 caracteres*' })
        .max(30, { message: 'Nickname deve ter no Maximo 30 caracteres*' }),
    ...profileCompletionFields,
});

export type CompleteOAuthUserPayload = z.infer<typeof completeOAuthUserSchema>;
export type CompleteProfileUserPayload = z.infer<typeof completeProfileUserSchema>;
export default completeOAuthUserSchema;
