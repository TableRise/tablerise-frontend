import React from 'react';
import { errorListTypes } from '@/types/shared/errorHandler';

export type CheckBoxFieldProps = {
    label: string;
    labelWithLink?: string;
    srcLink?: string;
    onChangeState: React.Dispatch<React.SetStateAction<boolean>>;
    inputValue: boolean;
    errorId: string;
    errorList: errorListTypes[];
};
