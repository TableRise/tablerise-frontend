import React from 'react';
import '@/components/authentication/styles/SubmitButton.css';

type SubmitButtonProps = {
    title: string;
};

export default function SubmitButton({ title }: SubmitButtonProps) {
    return (
        <button
            type="submit"
            className="button-submit font-S-bold bg-color-primary/default_900"
        >
            {title}
        </button>
    );
}
