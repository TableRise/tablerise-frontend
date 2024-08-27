import { errorListTypes } from '@/types/shared/errorHandler';
import { errorHandlerTypes } from '@/types/utils/errorHandler';

export default function errorHandler({
    emptyList,
    errorMessage,
}: errorHandlerTypes): errorListTypes[] {
    const result = [];
    if (emptyList) {
        emptyList.forEach((field: string) => {
            result.push({ inputId: field, message: 'Campo obrigatório' });
        });
    }

    if (errorMessage) {
        result.push(errorSerializer(errorMessage));
    }

    return result;
}

const errorSerializer = (errorMessage: string): errorListTypes => {
    switch (errorMessage) {
        case 'Nickname already exists in database':
            return { inputId: 'username', message: 'Esse usuário já foi cadastrado' };
        case 'Email already exists in database':
            return { inputId: 'email', message: 'Esse e-mail já foi cadastrado' };
        case 'password not match':
            return { inputId: 'password', message: 'Esses campos não coincidem' };
        case 'terms not accepted':
            return { inputId: 'checkbox', message: 'Você precisa aceitar os termos' };
        case 'Invalid email':
            return { inputId: 'email', message: 'E-mail invalido' };
        case 'Invalid password':
            return {
                inputId: 'password',
                message:
                    'Senha invalida, necessário ter 8-32 caracteres, maiúsculas, minúsculas e ao menos um caractere especial',
            };
        default:
            return { inputId: 'login', message: 'Erro ao fazer login' };
    }
};

export const verifyError = (errorList: errorListTypes[], errorId: string) => {
    return errorList.find((err: any) => err.inputId === errorId);
};
