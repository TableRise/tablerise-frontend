import React from 'react';

type SubmitButtonProps = {
    title: string;
};

export default function SubmitButton({ title }: SubmitButtonProps) {
    return <button type="submit">{title}</button>;
}
