import React from 'react';

type SubmitButtonProps = {
    title: string;
};

export default function SubmitButton({ title }: SubmitButtonProps) {
    return (
        <button
            type="submit"
            className="w-full h-12 button-L-fill bg-color-primary/default_900 rounded-xl font-S-bold text-color-greyScale/50"
        >
            {title}
        </button>
    );
}

