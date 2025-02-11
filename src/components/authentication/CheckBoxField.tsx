import Link from 'next/link';
import React from 'react';
import '@/components/authentication/styles/CheckBoxField.css';
import { CheckBoxFieldProps } from '@/types/modules/components/authentication/CheckBoxField';
import InputErrorMessage from './inputErrorMessage';

export default function CheckBoxField({
    label,
    labelWithLink,
    srcLink,
    name,
    register,
    error,
}: CheckBoxFieldProps): JSX.Element {
    return (
        <div className="checkbox-container">
            <label className="checkbox-label" htmlFor="checkBtn">
                <input
                    className="input-checkbox checkbox-default checked:checkbox-icon"
                    type="checkbox"
                    {...register(name)}
                    id="checkBtn"
                />
                <h3 className="checkbox-text font-XS-regular">
                    {label}{' '}
                    {labelWithLink && (
                        <Link
                            href={srcLink || ''}
                            className="checkbox-link font-XS-regular"
                        >
                            {' '}
                            {labelWithLink}
                        </Link>
                    )}
                </h3>
            </label>
            {error && <InputErrorMessage errorMessage={error.message} />}
        </div>
    );
}
