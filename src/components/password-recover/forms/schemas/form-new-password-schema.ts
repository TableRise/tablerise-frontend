import { z } from "zod";

export const newPasswordSchema = z.object({
    newPassword: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9_.]).{6,}$/,
      { message: "Use 6+ caracteres, maiúscula, minúscula, número e símbolo" }
    ),
    confirmPassword: z.string().min(1, { message: "O campo não pode estar vazio." }),
}).refine((data) => data.confirmPassword === data.newPassword, {
    message: "Esses campos não coincidem.",
    path: ["confirmPassword"], // Define o campo onde o erro será exibido
  });

export type NewPasswordSchema = z.infer<typeof newPasswordSchema>