export const STEPS = ['Informações básicas', 'Predefinições', 'História'] as const;
export type Step = 0 | 1 | 2;

export const AGE_RATINGS = [
    { label: 'L', color: '#12AD00' },
    { label: '10', color: '#1B8BFF' },
    { label: '14', color: '#E87722' },
    { label: '16', color: '#D32F2F' },
    { label: '+18', color: '#000' },
];

export function extractYouTubeId(url: string): string | null {
    const match = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
}

export function formatDateDisplay(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

interface Step1Fields {
    title: string;
    description: string;
    password: string;
}

interface Step1Errors {
    titleError: string;
    descError: string;
    passwordError: string;
}

export function validateStep1Fields({ title, description, password }: Step1Fields): {
    valid: boolean;
    errors: Step1Errors;
} {
    const errors: Step1Errors = { titleError: '', descError: '', passwordError: '' };
    let valid = true;

    if (!title.trim()) {
        errors.titleError = 'Nome da campanha é obrigatório';
        valid = false;
    }
    if (!description.trim()) {
        errors.descError = 'Descrição é obrigatória';
        valid = false;
    }
    if (password.trim() && !/^[a-zA-Z0-9]{4}$/.test(password)) {
        errors.passwordError = 'Senha deve ter exatamente 4 caracteres alfanuméricos';
        valid = false;
    }

    return { valid, errors };
}

interface Step2Fields {
    system: string;
    ageRestriction: string;
    visibility: string;
}

interface Step2Errors {
    systemError: string;
    ageError: string;
    visibilityError: string;
}

export function validateStep2Fields({
    system,
    ageRestriction,
    visibility,
}: Step2Fields): { valid: boolean; errors: Step2Errors } {
    const errors: Step2Errors = { systemError: '', ageError: '', visibilityError: '' };
    let valid = true;

    if (!system) {
        errors.systemError = 'Selecione um sistema de RPG';
        valid = false;
    }
    if (!ageRestriction) {
        errors.ageError = 'Selecione uma classificação indicativa';
        valid = false;
    }
    if (!visibility) {
        errors.visibilityError = 'Selecione a visibilidade';
        valid = false;
    }

    return { valid, errors };
}
