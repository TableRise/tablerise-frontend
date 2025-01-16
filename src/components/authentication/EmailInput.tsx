import React from 'react';
import '@/components/authentication/styles/TextInput.css';
import { EmailInputProps } from '@/types/modules/components/authentication/EmailInput';
import { verifyError } from '@/utils/errorHandler';
import InputErrorMessage from './inputErrorMessage';

export default function EmailInput({
    label,
    placeholder,
    onChangeState,
    inputValue,
    errorId,
    errorList = [],
}: EmailInputProps): JSX.Element {
    const hasError = verifyError(errorList, errorId);

    return (
        <label className="label">
            <h1 className="label-text font-S-bold">{label}</h1>
            <input
                className={` ${
                    hasError ? 'input-error-light' : 'input-default-light'
                } input font-XS-regular focus:input-active-light`}
                placeholder={placeholder}
                type="email"
                onChange={({ target: { value } }) => onChangeState(value)}
                value={inputValue}
            />
            {hasError && <InputErrorMessage errorMessage={hasError.message} />}
        </label>
    );
}
