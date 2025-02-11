import { ZodValidatorReturn } from '@/types/utils/zodValidator';
import { ZodSchema } from 'zod';

export default function zodValidator(schema: ZodSchema, data: any): ZodValidatorReturn {
    const validate = schema.safeParse(data);

    if (!validate.success) {
        return {
            zodErrors: validate.error.flatten().fieldErrors,
            message: 'Fields validations failed',
        };
    }

    return {
        zodErrors: null,
        message: '',
    };
}
