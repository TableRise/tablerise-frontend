import React from 'react';

type PasswordInputProps = {
    label: string;
    placeholder: string;
};

export default function PasswordInput({ label, placeholder }: PasswordInputProps) {
    return (
        <label className="flex-col">
            <h1>{label}</h1>
            <input placeholder={placeholder} type="password" />
        </label>
    );
}
