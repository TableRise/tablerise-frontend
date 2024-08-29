import { input } from '@/types/login/types';

export default function Input({ type, name, placeholder, onChange, id }: input) {
    const MAX_LENGTH_EMAIL = 30;
    const MAX_LENGTH_PASS = 50;

    return (
        <div>
            <label htmlFor={type}>
                {name}
                <input
                    id={id}
                    type={type}
                    maxLength={type === 'email' ? MAX_LENGTH_EMAIL : MAX_LENGTH_PASS}
                    placeholder={placeholder}
                    onChange={({ target }) => onChange(target.value)}
                />
            </label>
        </div>
    );
}
