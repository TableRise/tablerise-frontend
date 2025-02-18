import RegisterForm from '@/components/register/RegisterForm';
import SideImage from '@/components/register/SideImage';
import SocialLoginContainer from '@/components/common/SocialLoginContainer';
import '@/app/register/styles/Register.css';

import React, { Suspense } from 'react';
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
                    <div className="divider-container">
                        <div className="divider-line"></div>
                        <span className="dividee-content font-S-bold">
                            ou continue com
                        </span>
                        <div className="divider-line"></div>
                    </div>
                    <Suspense>
                        <SocialLoginContainer />
                    </Suspense>
                </div>
            </div>
        </section>
    );
}
