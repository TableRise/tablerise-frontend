import React, { useContext, useState } from 'react';
import { AxiosResponse } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import TableriseContext from '@/context/TableriseContext';
import Input from '@/components/common/forms/Input';
import Button from '@/components/common/forms/Button';
import zodValidator from '@/utils/zodValidator';
import { postLogin } from '@/server/users/login';
import { FormErrorsContract } from '@/types/modules/components/login/LoginFormCredentials';

import loginZodSchema, { LoginPayload } from './schemas/LoginSchema';
import './styles/LoginFormCredentials.css';

export default function LoginFormCredentials(): JSX.Element {
    const [loginCredentials, setLoginCredentials] = useState<LoginPayload>({
        email: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState<FormErrorsContract>({
        errorList: {},
        hasErrors: false,
        showErrorInputClass: false,
    });
    const [loginError, setLoginError] = useState('');
    const { loading, setLoading, newPassVisible } = useContext(TableriseContext);
    const router = useRouter();

    const handleLoginInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const { value, name } = event.target;

        setLoginCredentials({
            ...loginCredentials,
            [name]: value,
        });
    };

    //test

    const validateLoginForm = (): boolean => {
        const validateLoginCredentials = zodValidator(loginZodSchema, loginCredentials);

        if (validateLoginCredentials.zodErrors) {
            setFormErrors({
                errorList: validateLoginCredentials.zodErrors,
                hasErrors: true,
                showErrorInputClass: true,
            });

            return false;
        }

        setFormErrors({
            errorList: {},
            hasErrors: false,
            showErrorInputClass: false,
        });

        return true;
    };

    const loginConnect = async (): Promise<AxiosResponse | void> => {
        setLoading(true);
        const loginResult = await postLogin(loginCredentials);
        setLoading(false);

        if (loginResult.status === 401) {
            setLoginError('*Dados de email ou senha incorretos. Tente novamente.');
            return;
        }

        if (loginResult.status !== 200) {
            setLoginError('*Algo deu errado. Tente novamente.');
            return;
        }

        return loginResult;
    };

    const handleLoginActionClick = async (
        event: React.ChangeEvent<HTMLInputElement>
    ): Promise<void> => {
        event.preventDefault();
        if (!validateLoginForm()) return;

        const result = await loginConnect();

        if (!result) return;

        localStorage.setItem('userLogged', JSON.stringify(result.data));
        router.push('/');

        return;
    };

    return (
        <form className="login-form-credentials">
            <Input
                title="Email"
                inputStyle="input-default-light"
                classProps="email-input-login"
                setter={handleLoginInputChange}
                value={loginCredentials.email}
                name="email"
                type="email"
                placeholder="Insira o seu e-mail"
                errorToggles={formErrors}
            />
            <Input
                title="Senha"
                inputStyle="input-default-light"
                setter={handleLoginInputChange}
                value={loginCredentials.password}
                name="password"
                type={newPassVisible ? 'text' : 'password'}
                placeholder="Insira a sua senha"
                errorToggles={formErrors}
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
                    action={handleLoginActionClick}
                    disabled={loading}
                />
                {loginError && (
                    <span className="font-XXS-regular text-color-support/alert">
                        {loginError}
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
