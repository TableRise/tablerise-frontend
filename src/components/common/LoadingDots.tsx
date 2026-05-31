'use client';

import './styles/LoadingDots.css';

type LoadingDotsProps = {
    className?: string;
    label?: string;
};

export default function LoadingDots({
    className = '',
    label = 'Carregando',
}: LoadingDotsProps): JSX.Element {
    return (
        <span
            className={`loading-dots ${className}`.trim()}
            role="status"
            aria-live="polite"
            aria-label={label}
        >
            <span className="sr-only">{label}</span>
            <span className="loading-dots__dot" />
            <span className="loading-dots__dot" />
            <span className="loading-dots__dot" />
        </span>
    );
}
