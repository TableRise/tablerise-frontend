import React from 'react';
import '@/components/authentication/styles/TextInput.css';
import { TextInputProps } from '@/types/modules/components/authentication/TextInput';
import InputErrorMessage from './inputErrorMessage';
import { verifyError } from '@/utils/errorHandler';

export default function TextInput({
    label,
    placeholder,
    onChangeState,
    inputValue,
    errorId,
    errorList = [],
}: TextInputProps): JSX.Element {
    const hasError = verifyError(errorList, errorId);
    return (
        <label className="label">
            <h1 className="label-text font-S-bold">{label}</h1>
            <input
                className={` ${
                    hasError ? 'input-error-light' : 'input-default-light'
                } input font-XS-regular focus:input-active-light`}
                onChange={({ target: { value } }) => onChangeState(value)}
                value={inputValue}
                placeholder={placeholder}
                type="text"
            />
            {hasError && <InputErrorMessage errorMessage={hasError.message} />}
        </label>
    );
}
