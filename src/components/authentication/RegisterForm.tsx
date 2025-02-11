'use client';

import React, { useContext } from 'react';
import CheckBoxField from './CheckBoxField';
import { postRegister } from '@/server/users/register';
import { useRouter } from 'next/navigation';
import '@/components/authentication/styles/RegisterForm.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../common/forms/Input';
import Button from '../common/forms/Button';
import TableriseContext from '@/context/TableriseContext';
import registerZodSchema, { RegisterPayload } from './schema/RegisterSchema';

export default function RegisterForm(): JSX.Element {
    const {
        register,
        setError,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterPayload>({
        resolver: zodResolver(registerZodSchema),
    });

    const { newPassVisible } = useContext(TableriseContext);
    const router = useRouter();

    const sendRegister = async ({
        nickname,
        email,
        password,
    }: RegisterPayload): Promise<void> => {
        const registerPayload = {
            nickname,
            email,
            password,
        };

        try {
            await postRegister(registerPayload);
            router.push('/');
        } catch (error: any) {
            setError('confirmPassword', {
                type: 'manual',
                message: `${error.message}`,
            });
        }
    };

    return (
        <form className="form gap-4" onSubmit={handleSubmit(sendRegister)}>
            <Input
                title="Nome de usuário"
                classProps="w-full mt-1"
                inputStyle="input-default-light"
                setter={register}
                name="nickname"
                type="text"
                placeholder="Insira o seu nome de usuário"
                errorMessage={errors.nickname}
            />
            <Input
                title="E-mail"
                inputStyle="input-default-light"
                classProps="w-full mt-1"
                setter={register}
                name="email"
                type="email"
                placeholder="Insira o seu e-mail"
                errorMessage={errors.email}
            />
            <Input
                title="Senha"
                inputStyle="input-default-light"
                classProps="w-full mt-1"
                setter={register}
                name="password"
                type={newPassVisible ? 'text' : 'password'}
                placeholder="Insira a sua senha"
                errorMessage={errors.password}
                toggleVisibilityButton={true}
            />
            <Input
                title="Confirmar senha"
                inputStyle="input-default-light"
                classProps="w-full mt-1"
                setter={register}
                name="confirmPassword"
                type={newPassVisible ? 'text' : 'password'}
                placeholder="Confirme a sua senha"
                errorMessage={errors.confirmPassword}
                toggleVisibilityButton={true}
            />

            <CheckBoxField
                label="Eu li e concordo com os "
                labelWithLink=" termos e condições"
                srcLink="/terms"
                register={register}
                name="termsCheckBox"
                error={errors.termsCheckBox}
            />

            <Button
                title="Entrar"
                name="login-btn"
                buttonStyle="button-L-fill"
                props="font-S-bold text-color-greyScale/50"
                disabled={isSubmitting}
            />
        </form>
    );
}
