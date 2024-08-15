import Link from 'next/link';
import React from 'react';

type CheckBoxFieldProps = {
    label: string;
    labelWithLink?: string;
    srcLink?: string;
};

export default function CheckBoxField({
    label,
    labelWithLink,
    srcLink,
}: CheckBoxFieldProps) {
    return (
        <label className="flex items-center">
            <input
                className="
            
                appearance-none
                checkbox-default
                checked:checkbox-icon
                checked:bg-color-primary/default_900
                "
                type="checkbox"
            />
            <h3 className="font-XS-regular text-color-greyScale/950">
                {label}{' '}
                {labelWithLink && (
                    <Link
                        href={srcLink || ''}
                        className="font-XS-regular underline text-color-primary/800"
                    >
                        {' '}
                        {labelWithLink}
                    </Link>
                )}
            </h3>
        </label>
    );
}
