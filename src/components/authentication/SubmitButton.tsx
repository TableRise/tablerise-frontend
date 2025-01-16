import React from 'react';
import '@/components/authentication/styles/SubmitButton.css';
import { SubmitButtonProps } from '@/types/modules/components/authentication/SubmitButton';

export default function SubmitButton({ title }: SubmitButtonProps): JSX.Element {
    return (
        <button
            type="submit"
            className="button-submit font-S-bold bg-color-primary/default_900"
        >
            {title}
        </button>
    );
}
