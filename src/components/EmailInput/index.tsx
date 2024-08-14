import React from 'react';

type EmailInputProps = {
    label: string;
    placeholder: string;
};

export default function EmailInput({ label, placeholder }: EmailInputProps) {
    return (
        <label className="flex-col">
            <h1>{label}</h1>
            <input placeholder={placeholder} type="email" />
        </label>
    );
}
