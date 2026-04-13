type AllowedPattern = 'alphanumeric' | 'numeric';

const PATTERNS: Record<AllowedPattern, RegExp> = {
    alphanumeric: /^[a-zA-Z0-9]$/,
    numeric: /^[0-9]$/,
};

export function handleOtpKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    fieldPrefix: string,
    pattern: AllowedPattern = 'alphanumeric'
) {
    const inputElement = e.currentTarget;

    if (!PATTERNS[pattern].test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
        e.preventDefault();
        return;
    }

    if ((e.key === 'Backspace' || e.key === 'Delete') && inputElement.value === '') {
        const previousField = document.getElementById(
            `${fieldPrefix}${index - 1}`
        ) as HTMLInputElement | null;
        if (previousField) {
            previousField.focus();
        }
    } else if (
        inputElement.value.length === 1 &&
        e.key !== 'Backspace' &&
        e.key !== 'Delete'
    ) {
        inputElement.value = '';
    }
}

export function handleOtpAutoAdvance(
    e: React.FormEvent<HTMLInputElement>,
    index: number,
    fieldPrefix: string
) {
    const { value } = e.currentTarget;

    if (value.length === 1) {
        const nextField = document.getElementById(
            `${fieldPrefix}${index + 1}`
        ) as HTMLInputElement | null;
        if (nextField) {
            nextField.focus();
        }
    } else if (value.length === 0 && index > 0) {
        const previousField = document.getElementById(
            `${fieldPrefix}${index - 1}`
        ) as HTMLInputElement | null;
        if (previousField) {
            previousField.focus();
        }
    }
}

export function handleOtpPaste(
    e: React.ClipboardEvent<HTMLInputElement>,
    length: number,
    onDigitsFilled: (chars: string[]) => void
) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('Text').replace(/\s/g, '').slice(0, length);
    const chars = new Array(length).fill('');
    pasted.split('').forEach((char, i) => {
        chars[i] = char.toUpperCase();
    });
    onDigitsFilled(chars);
}
