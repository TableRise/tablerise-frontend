'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import EmailInput from './EmailInput';
import PasswordInput from './PasswordInput';
import SubmitButton from './SubmitButton';
import { postRegister } from '@/server/users/api';
import { useRouter } from 'next/navigation';
import errorHandler from '@/utils/errorHandler';
import '@/components/authentication/styles/RegisterForm.css';
import { errorListTypes } from '@/types/shared/errorHandler';
import validateLoginFields from '@/utils/validateLoginFields';

export default function LoginForm(): JSX.Element {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorList, setErrorList] = useState<errorListTypes[]>([]);
    const router = useRouter();

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();

        const fieldsValidation = validateLoginFields({
            email,
            password,
        });

        if (fieldsValidation.length > 0) {
            setErrorList(fieldsValidation);
            return;
        }

        const registerPayload = {
            email,
            password,
        };

        try {
            await postRegister(registerPayload);
            router.push('/');
        } catch (error: any) {
            const errorResponse = errorHandler({
                errorMessage: error.response.data.message,
            });

            setErrorList(errorResponse);
            return;
        }
        setErrorList([]);
        return;
    };

    return (
        <form className="form" onSubmit={(event) => handleSubmit(event)}>
            <EmailInput
                label="E-mail"
                placeholder="Insira o seu e-mail"
                onChangeState={setEmail}
                inputValue={email}
                errorId={'email'}
                errorList={errorList}
            />
            <PasswordInput
                label="Senha"
                placeholder="Insira a sua senha"
                onChangeState={setPassword}
                inputValue={password}
                errorId={'password'}
                errorList={errorList}
            />
            <h2 className="subtitle-text font-XS-regular">
                <Link
                    href={'/register'}
                    className="font-XS-regular underline text-color-primary/800"
                >Esqueceu a senha?
                </Link>
            </h2>
            <SubmitButton title="Entrar" />
        </form>
    );
}
