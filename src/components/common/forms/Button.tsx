import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    buttonStyle: string;
    props: string;
}

export default function Button({
    buttonStyle,
    props,
    title,
    name,
    id = name,
    type,
    disabled = false,
}: ButtonProps): JSX.Element {
    return (
        <button
            name={name}
            id={id}
            disabled={disabled}
            className={`${buttonStyle} ${props}`}
            type={type}
        >
            {title}
        </button>
    );
}
