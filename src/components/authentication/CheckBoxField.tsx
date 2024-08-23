import Link from 'next/link';
import React from 'react';
import '@/components/authentication/styles/CheckBoxField.css';
import { CheckBoxFieldProps } from '@/types/modules/components/authentication/CheckBoxField';

export default function CheckBoxField({
    label,
    labelWithLink,
    srcLink,
    onChangeState,
    inputValue,
    errorId,
    errorList,
}: CheckBoxFieldProps): JSX.Element {
    const hasError = errorList.inputId === errorId;
    return (
        <div className="checkbox-container">
            <label className="checkbox-label" htmlFor="checkBtn">
                <input
                    className="input-checkbox checkbox-default checked:checkbox-icon"
                    type="checkbox"
                    onChange={({ target: { checked } }) => onChangeState(checked)}
                    checked={inputValue}
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
            {hasError && (
                <p className="error-message font-XXS-bold">{errorList.message}</p>
            )}
        </div>
    );
}
