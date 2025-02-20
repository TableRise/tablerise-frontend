import { z } from 'zod';
import regexCollection from '@/utils/regexCollection';

const loginZodSchema = z.object({
    email: z.string().email({ message: 'Endereço de e-mail inválido*' }),
    password: z.string().regex(regexCollection.regexForPasswordValidation, {
        message:
            'Use entre 8 e 32 caracteres, incluindo pelo menos uma letra maiúscula, um número e um dos símbolos: !@#$&*',
    }),
});

export type LoginPayload = z.infer<typeof loginZodSchema>;
export default loginZodSchema;
