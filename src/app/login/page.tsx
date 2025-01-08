import LoginForm from '@/components/authentication/LoginForm';
import SideImage from '@/components/authentication/SideImage';
import SocialLoginContainer from '@/components/authentication/SocialLoginContainer';
import '@/app/register/styles/Register.css';

import React, { Suspense } from 'react';
import Link from 'next/link';

export default function Login(): JSX.Element {
    return (
        <section className="section">
            <div className="side-image-container">
                <SideImage />
            </div>
            <div className="side-form-container">
                <div className="form-container">
                    <div className="title-container">
                        <h1 className="title-text font-L-semibold">Entrar</h1>
                        <h2 className="subtitle-text font-XS-regular">
                            Não possui uma conta?{' '}
                            <Link
                                href={'/register'}
                                className="font-XS-regular underline text-color-primary/800"
                            >
                                Criar conta!
                            </Link>
                        </h2>
                    </div>
                    <LoginForm />
                    <div className="divider-container">
                        <div className="divider-line"></div>
                        <span className="divider-content font-S-bold">
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
