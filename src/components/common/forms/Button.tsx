import { ButtonHTMLAttributes } from 'react';
import LoadingDots from '@/components/common/LoadingDots';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    buttonStyle: string;
    props: string;
    loading?: boolean;
    loadingLabel?: string;
}

export default function Button({
    buttonStyle,
    props,
    title,
    name,
    id = name,
    type,
    disabled = false,
    loading = false,
    loadingLabel,
}: ButtonProps): JSX.Element {
    return (
        <button
            name={name}
            id={id}
            disabled={disabled}
            aria-busy={loading || undefined}
            className={`${buttonStyle} ${props}`}
            type={type}
        >
            {loading ? (
                <LoadingDots
                    label={
                        loadingLabel ??
                        (typeof title === 'string' ? title : 'Carregando')
                    }
                />
            ) : (
                title
            )}
        </button>
    );
}
