import RegisterForm from '@/components/authentication/RegisterForm';
import SideImage from '@/components/authentication/SideImage';
import SocialLoginContainer from '@/components/authentication/SocialLoginContainer';
import '@/app/register/styles/Register.css';

import React from 'react';
import Link from 'next/link';

export default function Register(): JSX.Element {
    return (
        <section className="section">
            <div className="side-image-container">
                <SideImage />
            </div>
            <div className="side-form-container">
                <div className="form-container">
                    <div className="title-container">
                        <h1 className="title-text font-L-semibold">Criar Conta</h1>
                        <h2 className="subtitle-text font-XS-regular">
                            Já possui uma conta?{' '}
                            <Link
                                href={'/login'}
                                className="font-XS-regular underline text-color-primary/800"
                            >
                                Entrar
                            </Link>
                        </h2>
                    </div>
                    <RegisterForm />
                    <h3 className="divide-container font-S-bold">ou continue com</h3>
                    <SocialLoginContainer />
                </div>
            </div>
        </section>
    );
}
