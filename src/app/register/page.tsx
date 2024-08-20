import RegisterForm from '@/components/authentication/RegisterForm';
import SideImage from '@/components/authentication/SideImage';
import SocialLoginContainer from '@/components/authentication/SocialLoginContainer';
import '@/app/register/styles/Register.css';

import React from 'react';
import Link from 'next/link';

export default function Register() {
    return (
        <section className="section">
            <div className="side-image-container">
                <SideImage />
            </div>
            <div className="side-form-container">
                <div className="form-container">
                    <div className="flex flex-col w-full mb-6">
                        <h1 className="font-L-semibold text-color-primary/default_900 mb-1">
                            Criar Conta
                        </h1>
                        <h2 className="font-XS-regular text-color-greyScale/950">
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
                    <h3 className="px-3 py-0 font-S-bold text-color-greyScale/950 mb-3">
                        ou continue com
                    </h3>
                    <SocialLoginContainer />
                </div>
            </div>
        </section>
    );
}
