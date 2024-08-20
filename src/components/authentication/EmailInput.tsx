import React from 'react';

type EmailInputProps = {
    label: string;
    placeholder: string;
    onChangeState: React.Dispatch<React.SetStateAction<string>>;
    inputValue: string;
    errorId: string;
    errorList: any;
};

export default function EmailInput({
    label,
    placeholder,
    onChangeState,
    inputValue,
    errorId,
    errorList,
}: EmailInputProps) {
    const hasError = errorList.inputId === errorId;

    return (
        <label className="w-full mb-4">
            <h1 className="font-S-bold text-color-greyScale/950 mb-2">{label}</h1>
            <input
                className="w-full h-10 input-default-light font-XS-regular text-color-greyScale/500"
                placeholder={placeholder}
                type="email"
                onChange={({ target: { value } }) => onChangeState(value)}
                value={inputValue}
            />
            {hasError && (
                <p className="font-XXS-bold text-color-suport/alert">
                    {errorList.message}
                </p>
            )}
        </label>
    );
}
