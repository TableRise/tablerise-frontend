import React from 'react';

type TextInputProps = {
    label: string;
    placeholder: string;
};

export default function TextInput({ label, placeholder }: TextInputProps) {
    return (
        <label className="flex-col">
            <h1>{label}</h1>
            <input placeholder={placeholder} type="text" />
        </label>
    );
}
