'use client';

import React, { useState } from 'react';
import TextInput from '../TextInput';
import EmailInput from '../EmailInput';
import PasswordInput from '../PasswordInput';
import CheckBoxField from '../CheckBoxField';
import SubmitButton from '../SubmitButton';

export default function RegisterForm(): JSX.Element {
    const [userName, setUserName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [termsCheckBox, setRermsCheckBox] = useState<boolean>(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const registerPayload = {
            userName,
            email,
            password,
            confirmPassword,
            termsCheckBox,
        };
        console.log('Register ~ RegisterForm ~ handleSubmit: ', registerPayload);
        return;
    };

    return (
        <form
            className="flex flex-col w-full mb-6"
            onSubmit={(event) => handleSubmit(event)}
        >
            <TextInput
                label="Nome de usuário"
                placeholder="Insira o seu nome de usuário"
                onChangeState={setUserName}
                inputValue={userName}
            />
            <EmailInput
                label="E-mail"
                placeholder="Insira o seu e-mail"
                onChangeState={setEmail}
                inputValue={email}
            />
            <PasswordInput
                label="Senha"
                placeholder="Insira a sua senha"
                onChangeState={setPassword}
                inputValue={password}
            />
            <PasswordInput
                label="Confirmar senha"
                placeholder="Confirme a sua senha"
                onChangeState={setConfirmPassword}
                inputValue={confirmPassword}
            />
            <CheckBoxField
                label="Eu li e concordo com os "
                labelWithLink=" termos e condições"
                srcLink="/terms"
                onChangeState={setRermsCheckBox}
                inputValue={termsCheckBox}
            />
            <SubmitButton title="Confirmar" />
        </form>
    );
}

