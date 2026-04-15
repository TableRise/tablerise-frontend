import { z } from 'zod';

const completeOAuthUserSchema = z.object({
    nickname: z
        .string()
        .min(3, { message: 'Nickname deve ter no mínimo 3 caracteres*' })
        .max(30, { message: 'Nickname deve ter no máximo 30 caracteres*' }),
    firstName: z
        .string()
        .min(2, { message: 'Nome deve ter no mínimo 2 caracteres*' }),
    lastName: z
        .string()
        .min(2, { message: 'Sobrenome deve ter no mínimo 2 caracteres*' }),
    birthday: z
        .string()
        .min(1, { message: 'Data de nascimento é obrigatória*' }),
});

export type CompleteOAuthUserPayload = z.infer<typeof completeOAuthUserSchema>;
export default completeOAuthUserSchema;
