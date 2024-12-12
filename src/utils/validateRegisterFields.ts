import { validateRagisterFieldsTypes } from '@/types/utils/validateRagisterFields';
import { errorListTypes } from './../types/shared/errorHandler.d';
import errorHandler from './errorHandler';

export default function validateRagisterFields({
    nickname,
    email,
    password,
    confirmPassword,
    termsCheckBox,
}: validateRagisterFieldsTypes): errorListTypes[] {
    const result = [];
    const emptyFields: string[] = [];
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*\d).{8,32}$/;

    Object.entries({ nickname, email, password }).forEach((field) => {
        if (!field[1]) {
            emptyFields.push(field[0]);
        }
    });

    if (emptyFields.length > 0) {
        const newErrorList = errorHandler({ emptyList: emptyFields });
        result.push(...newErrorList);
    }

    if (!emailRegex.test(email)) {
        const newErrorList = errorHandler({ errorMessage: 'Invalid email' });
        result.push(...newErrorList);
    }

    if (!passwordRegex.test(password)) {
        const newErrorList = errorHandler({ errorMessage: 'Invalid password' });
        result.push(...newErrorList);
    }

    if (password !== confirmPassword) {
        const newErrorList = errorHandler({ errorMessage: 'password not match' });
        result.push(...newErrorList);
    }

    if (!termsCheckBox) {
        const newErrorList = errorHandler({ errorMessage: 'terms not accepted' });
        result.push(...newErrorList);
    }

    return result;
}
