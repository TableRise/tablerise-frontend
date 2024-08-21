import React from 'react';
import '@/components/authentication/styles/TextInput.css';

type TextInputProps = {
    label: string;
    placeholder: string;
    onChangeState: React.Dispatch<React.SetStateAction<string>>;
    inputValue: string;
    errorId: string;
    errorList: any;
};

export default function TextInput({
    label,
    placeholder,
    onChangeState,
    inputValue,
    errorId,
    errorList,
}: TextInputProps) {
    const hasError = errorList.inputId === errorId;
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
            {hasError && (
                <p className="error-message font-XXS-bold">{errorList.message}</p>
            )}
        </label>
    );
}
