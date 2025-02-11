import React from 'react';
import { errorListTypes } from '@/types/shared/errorHandler';
import { RegisterPayload } from '@/components/authentication/schema/RegisterSchema';

export type CheckBoxFieldProps = {
    label: string;
    labelWithLink?: string;
    srcLink?: string;
    register?: UseFormRegister<RegisterPayload>;
    name?: string;
    error?: FieldError | undefined;
};
