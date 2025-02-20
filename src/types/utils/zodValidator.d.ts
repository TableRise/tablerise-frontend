import { typeToFlattenedError } from 'zod';

export interface ZodValidatorReturn {
    zodErrors: any;
    message: string;
}
