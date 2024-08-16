import React from 'react';

type EmailInputProps = {
    label: string;
    placeholder: string;
};

export default function EmailInput({ label, placeholder }: EmailInputProps) {
    return (
        <label className="w-full mb-4">
            <h1 className="font-S-bold text-color-greyScale/950 mb-2">{label}</h1>
            <input
                className="w-full h-10 input-default-light font-XS-regular text-color-greyScale/500"
                placeholder={placeholder}
                type="email"
            />
        </label>
    );
}
