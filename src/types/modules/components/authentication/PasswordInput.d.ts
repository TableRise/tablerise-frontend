import React from 'react';
import { errorListTypes } from '@/types/shared/errorHandler';

export type PasswordInputProps = {
    label: string;
    placeholder: string;
    onChangeState: React.Dispatch<React.SetStateAction<string>>;
    inputValue: string;
    errorId: string;
    errorList: errorListTypes[];
};
