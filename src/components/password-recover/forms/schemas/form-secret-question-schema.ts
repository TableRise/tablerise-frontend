import { z } from 'zod';

export const secretQuestionSchema = z.object({
    secretAnswer: z.string(),
});

export type SecretQuestionSchema = z.infer<typeof secretQuestionSchema>;
