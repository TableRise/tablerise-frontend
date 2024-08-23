import { z } from "zod";

export const twoFactorSchema = z.object({
    fild0: z.string(),
    fild1: z.string(),
    fild2: z.string(),
    fild3: z.string(),
    fild4: z.string(),
    fild5: z.string(),
}).refine((data) => {
    // Verifica se todos os campos são números e não estão vazios
    return Object.values(data).every((value) => value.trim() !== "" && /^\d+$/.test(value));
}, {
    message: "Todos os campos devem ser preenchidos com números.",
    path: ["fild0"], // Define um erro global
});

export type TwoFactorSchema = z.infer<typeof twoFactorSchema>