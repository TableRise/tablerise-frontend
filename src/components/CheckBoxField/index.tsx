import React from 'react';

type CheckBoxFieldProps = {
    label: string;
};

export default function CheckBoxField({ label }: CheckBoxFieldProps) {
    return (
        <label className="flex">
            <input type="checkbox" />
            {label}
        </label>
    );
}
