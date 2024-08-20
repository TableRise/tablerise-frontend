import React from 'react';

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
        <label className="w-full mb-4">
            <h1 className="font-S-bold text-color-greyScale/950 mb-2">{label}</h1>
            <input
                className={`w-full h-10 ${
                    hasError ? 'input-error-light' : 'input-default-light'
                } font-XS-regular  focus:input-active-light focus:w-full focus:h-10`}
                onChange={({ target: { value } }) => onChangeState(value)}
                value={inputValue}
                placeholder={placeholder}
                type="text"
            />
            {hasError && (
                <p className="font-XXS-bold text-color-suport/alert">
                    {errorList.message}
                </p>
            )}
        </label>
    );
}
