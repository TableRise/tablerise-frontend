import React from 'react';
import '@/components/authentication/styles/TextInput.css';

type PasswordInputProps = {
    label: string;
    placeholder: string;
    onChangeState: React.Dispatch<React.SetStateAction<string>>;
    inputValue: string;
    errorId: string;
    errorList: any;
};

export default function PasswordInput({
    label,
    placeholder,
    onChangeState,
    inputValue,
    errorId,
    errorList,
}: PasswordInputProps) {
    const hasError = errorList.inputId === errorId;
    return (
        <label className="label">
            <h1 className="label-text font-S-bold">{label}</h1>
            <input
                className={` ${
                    hasError ? 'input-error-light' : 'input-i2-light'
                } input font-XS-regular focus:input-active-light`}
                placeholder={placeholder}
                type="password"
                onChange={({ target: { value } }) => onChangeState(value)}
                value={inputValue}
            />
            {hasError && (
                <p className="error-message font-XXS-bold">{errorList.message}</p>
            )}
        </label>
    );
}
