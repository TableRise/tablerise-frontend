import React, { useState } from 'react';
import '@/components/authentication/styles/TextInput.css';
import { PasswordInputProps } from '@/types/modules/components/authentication/PasswordInput';
import VisibilityIcon from '../../../assets/icons/sys/visibility.svg';
import VisibilityOffIcon from '../../../assets/icons/sys/visibility-off.svg';

export default function PasswordInput({
    label,
    placeholder,
    onChangeState,
    inputValue,
    errorId,
    errorList,
}: PasswordInputProps): JSX.Element {
    const hasError = errorList.inputId === errorId;
    const [visible, setVisible] = useState<boolean>(false);
    return (
        <label className="label">
            <h1 className="label-text font-S-bold">{label}</h1>
            <div className="flex justify-between items-center ">
                <input
                    className={` ${
                        hasError ? 'input-error-light' : 'input-i2-light'
                    } input font-XS-regular focus:input-active-light`}
                    placeholder={placeholder}
                    type={visible ? 'text' : 'password'}
                    onChange={({ target: { value } }) => onChangeState(value)}
                    value={inputValue}
                />
                <span
                    className="flex justify-around items-center"
                    onClick={() => setVisible((prevState) => !prevState)}
                >
                    {visible ? (
                        <VisibilityOffIcon
                            className="absolute mr-10 bg-colo w-6 h-6"
                            color="#7c7c7c"
                        />
                    ) : (
                        <VisibilityIcon
                            className="absolute mr-10 w-6 h-6"
                            color="#7c7c7c"
                        />
                    )}
                </span>
            </div>
            {hasError && (
                <p className="error-message font-XXS-bold">{errorList.message}</p>
            )}
        </label>
    );
}
