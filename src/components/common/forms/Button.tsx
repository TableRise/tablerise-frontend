export default function Button({
    buttonStyle,
    props,
    title,
    name,
    id = name,
    action,
    type,
    disabled = false,
}: any): JSX.Element {
    return (
        <button
            name={name}
            id={id}
            onClick={(event) => action(event)}
            disabled={disabled}
            className={`${buttonStyle} ${props}`}
            type={type}
        >
            {title}
        </button>
    );
}
