import React from 'react';

type TextInputProps = {
    label: string;
    placeholder: string;
};

export default function TextInput({ label, placeholder }: TextInputProps) {
    return (
        <label className="w-full">
            <h1 className="font-S-bold text-color-greyScale/950">{label}</h1>
            <input
                className="w-full h-10 input-default-light font-XS-regular text-color-greyScale/500"
                placeholder={placeholder}
                type="text"
            />
        </label>
    );
}
