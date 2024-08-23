import { errorListTypes } from '@/types/shared/errorHandler';

export default function errorHandler(error: string): errorListTypes {
    switch (error) {
        case 'username in use':
            return { inputId: 'username', message: 'Esse usuário já foi cadastrado' };
        case 'email in use':
            return { inputId: 'email', message: 'Esse e-mail já foi cadastrado' };
        case 'password not match':
            return { inputId: 'password', message: 'Esses campos não coincidem' };
        case 'terms not accepted':
            return { inputId: 'checkbox', message: 'Você precisa aceitar os termos' };
        default:
            return { inputId: 'login', message: 'Erro ao fazer login' };
    }
}
