import React from 'react';
import TextInput from '../TextInput';
import EmailInput from '../EmailInput';
import PasswordInput from '../PasswordInput';
import CheckBoxField from '../CheckBoxField';
import SubmitButton from '../SubmitButton';

export default function RegisterForm() {
    return (
        <form className="flex flex-col w-full mb-6">
            <TextInput
                label="Nome de usuário"
                placeholder="Insira o seu nome de usuário"
            />
            <EmailInput label="E-mail" placeholder="Insira o seu e-mail" />
            <PasswordInput label="Senha" placeholder="Insira a sua senha" />
            <PasswordInput label="Confirmar senha" placeholder="Confirme a sua senha" />
            <CheckBoxField
                label="Eu li e concordo com os "
                labelWithLink=" termos e condições"
                srcLink="/terms"
            />
            <SubmitButton title="Confirmar" />
        </form>
    );
}
