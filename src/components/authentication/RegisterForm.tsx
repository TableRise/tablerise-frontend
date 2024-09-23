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
import validateRagisterFields from '@/utils/validateRegisterFields';

export default function RegisterForm(): JSX.Element {
    const [nickname, setNickname] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [termsCheckBox, setRermsCheckBox] = useState<boolean>(false);
    const [errorList, setErrorList] = useState<errorListTypes[]>([]);
    const router = useRouter();

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();

        const fieldsValidation = validateRagisterFields({
            nickname,
            email,
            password,
            confirmPassword,
            termsCheckBox,
        });

        if (fieldsValidation.length > 0) {
            setErrorList(fieldsValidation);
            return;
        }

        const registerPayload = {
            nickname,
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
            <TextInput
                label="Nome de usuário"
                placeholder="Insira o seu nome de usuário"
                onChangeState={setNickname}
                inputValue={nickname}
                errorId={'nickname'}
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
