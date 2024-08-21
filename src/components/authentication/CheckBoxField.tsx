import Link from 'next/link';
import React from 'react';
import '@/components/authentication/styles/CheckBoxField.css';

type CheckBoxFieldProps = {
    label: string;
    labelWithLink?: string;
    srcLink?: string;
    onChangeState: React.Dispatch<React.SetStateAction<boolean>>;
    inputValue: boolean;
    errorId: string;
    errorList: any;
};

export default function CheckBoxField({
    label,
    labelWithLink,
    srcLink,
    onChangeState,
    inputValue,
    errorId,
    errorList,
}: CheckBoxFieldProps) {
    const hasError = errorList.inputId === errorId;
    return (
        <div className="checkbox-container">
            <label className="checkbox-label">
                <input
                    className="input-checkbox checkbox-default checked:checkbox-icon"
                    type="checkbox"
                    onChange={({ target: { checked } }) => onChangeState(checked)}
                    checked={inputValue}
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
