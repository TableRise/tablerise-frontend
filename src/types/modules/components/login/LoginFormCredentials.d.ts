import { z } from 'zod';

const registerZodSchema = z
    .object({
        nickname: z.string().min(3, { message: 'Nome do usuario não informado*' }),
        email: z.string().email({ message: 'Endereço de e-mail inválido*' }),
        password: z.string().regex(/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*\d).{8,32}$/, {
            message:
                'Minimo 8 a 32 caracteres, uma letra maiúscula, um número e um dos símbolos: !@#$&*',
        }),
        confirmPassword: z.string().min(1, { message: 'O campo não pode estar vazio.' }),
        termsCheckBox: z.boolean().refine((value) => value === true, {
            message: 'Você deve aceitar os termos para continuar',
        }),
    })
    .refine((data) => data.confirmPassword === data.password, {
        message: 'Esses campos não coincidem*',
        path: ['confirmPassword'],
    });

export type RegisterPayload = z.infer<typeof registerZodSchema>;
export default registerZodSchema;
