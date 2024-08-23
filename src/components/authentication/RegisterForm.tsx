'use client';

import React, { useState } from 'react';
import TextInput from './TextInput';
import EmailInput from './EmailInput';
import PasswordInput from './PasswordInput';
import CheckBoxField from './CheckBoxField';
import SubmitButton from './SubmitButton';
import { postRegister } from '@/server/users/api';
import { useRouter } from 'next/navigation';
import errorHandler from '@/utils/errorHandler';
import '@/components/authentication/styles/RegisterForm.css';
import { errorListTypes } from '@/types/shared/errorHandler';

export default function RegisterForm(): JSX.Element {
    const [userName, setUserName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [termsCheckBox, setRermsCheckBox] = useState<boolean>(false);
    const [errorList, setErrorList] = useState<errorListTypes>({});
    const router = useRouter();

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();
        const registerPayload = {
            userName,
            email,
            password,
            confirmPassword,
            termsCheckBox,
        };

        try {
            await postRegister(registerPayload);
            router.push('/home');
        } catch (error: any) {
            const errorResponse = errorHandler('terms not accepted');
            setErrorList(errorResponse);
        }

        return;
    };

    return (
        <form className="form" onSubmit={(event) => handleSubmit(event)}>
            <TextInput
                label="Nome de usuário"
                placeholder="Insira o seu nome de usuário"
                onChangeState={setUserName}
                inputValue={userName}
                errorId={'username'}
                errorList={errorList}
            />
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
            <PasswordInput
                label="Confirmar senha"
                placeholder="Confirme a sua senha"
                onChangeState={setConfirmPassword}
                inputValue={confirmPassword}
                errorId={'password'}
                errorList={errorList}
            />
            <CheckBoxField
                label="Eu li e concordo com os "
                labelWithLink=" termos e condições"
                srcLink="/terms"
                onChangeState={setRermsCheckBox}
                inputValue={termsCheckBox}
                errorId={'checkbox'}
                errorList={errorList}
            />
            <SubmitButton title="Confirmar" />
        </form>
    );
}
