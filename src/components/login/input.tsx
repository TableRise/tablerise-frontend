export default function Input({ props }: any) {
    const MAX_LENGTH_EMAIL = 30;
    const MAX_LENGTH_PASS = 50;

    return (
        <div>
            <label htmlFor={props.type}>{props.name}
                <input
                    id={props.id}
                    type={props.type}
                    maxLength={props.type === 'email' ? MAX_LENGTH_EMAIL : MAX_LENGTH_PASS }
                    placeholder={props.placeholder}
                    onChange={({ target }) => props.onChange(target.value)}
                />
            </label>
        </div>
    )
}