const passwordRegex: RegExp = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*\d).{8,32}$/;
const emailRegex: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
const MIN_LENGTH_PASS = 8;
const MAX_LENGTH_PASS = 32;

export default function validateInput(email: string, password: string): void | boolean {
    if (!passwordRegex.test(password)) {
        throw Error('Senha inválida');
    }
    if (emailRegex.test(email)) {
        throw Error('Email inválido');
    }
    if (password.length < MAX_LENGTH_PASS) {
        throw Error('Senha muito grande');
    }
    if (password.length < MIN_LENGTH_PASS) {
        throw Error('Senha muito curta');
    }
    return;
}
