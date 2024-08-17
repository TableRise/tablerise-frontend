import React from 'react';

type PasswordInputProps = {
    label: string;
    placeholder: string;
    onChangeState: React.Dispatch<React.SetStateAction<string>>;
    inputValue: string;
};

export default function PasswordInput({
    label,
    placeholder,
    onChangeState,
    inputValue,
}: PasswordInputProps) {
    return (
        <label className="w-full mb-4">
            <h1 className="font-S-bold text-color-greyScale/950 mb-2">{label}</h1>
            <input
                className="w-full h-10 input-i2-light font-XS-regular text-color-greyScale/500"
                placeholder={placeholder}
                type="password"
                onChange={({ target: { value } }) => onChangeState(value)}
                value={inputValue}
            />
        </label>
    );
}
