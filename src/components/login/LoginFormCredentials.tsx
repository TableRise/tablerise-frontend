import React, { useContext } from 'react';
import { AxiosResponse } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import TableriseContext from '@/context/TableriseContext';
import Input from '@/components/common/forms/Input';
import Button from '@/components/common/forms/Button';
import { postLogin } from '@/server/users/login';

import loginZodSchema, { LoginPayload } from './schemas/LoginSchema';
import './styles/LoginFormCredentials.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function LoginFormCredentials(): JSX.Element {
    const {
        register,
        formState: { errors, isSubmitting },
        handleSubmit,
        setError,
    } = useForm<LoginPayload>({
        resolver: zodResolver(loginZodSchema),
    });

    const login = async (value: LoginPayload): Promise<AxiosResponse | void> => {
        try {
            const loginResult = await postLogin(value);

            if (!loginResult) return;

            localStorage.setItem('userLogged', JSON.stringify(loginResult.data));
            router.push('/');

            return;
        } catch (error: Error | any) {
            setError('root', {
                type: 'manual',
                message: `${error.message}`,
            });
        }
    };

    const { newPassVisible } = useContext(TableriseContext);
    const router = useRouter();

    return (
        <form className="login-form-credentials" onSubmit={handleSubmit(login)}>
            <Input
                title="Email"
                inputStyle="input-default-light"
                classProps="email-input-login"
                setter={register}
                name="email"
                type="email"
                placeholder="Insira o seu e-mail"
                errorMessage={errors.email}
            />
            <Input
                title="Senha"
                inputStyle="input-default-light"
                setter={register}
                name="password"
                type={newPassVisible ? 'text' : 'password'}
                placeholder="Insira a sua senha"
                errorMessage={errors.password}
                toggleVisibilityButton={true}
            />
            <Link
                href="/password-recover"
                className="font-XS-regular text-color-primary/800"
            >
                Esqueceu a senha?
            </Link>
            <div className="login-form-credentials-buttons">
                <Button
                    title="Entrar"
                    name="login-btn"
                    buttonStyle="button-L-fill"
                    props="font-S-bold text-color-greyScale/50"
                    disabled={isSubmitting}
                />
                {isSubmitting ? <span>test</span> : <span>fela</span>}
                {errors.root && (
                    <span className="font-XXS-regular text-color-support/alert">
                        {errors.root.message}
                    </span>
                )}
                <div className="divider-container">
                    <div className="divider-line"></div>
                    <span className="dividee-content font-S-bold">ou continue com</span>
                    <div className="divider-line"></div>
                </div>
            </div>
        </form>
    );
}
