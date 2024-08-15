import RegisterForm from '@/components/RegisterForm';
import SideImage from '@/components/SideImage';
import SocialLoginButton from '../../components/SocialLoginButton';
import discordLogo from '../../../assets/icons/social-midia/discord.svg';
import googleLogo from '../../../assets/icons/social-midia/google.svg';
import React from 'react';
import Link from 'next/link';

export default function Register() {
    return (
        <section className="flex w-screen h-screen">
            <div className="w-1/2">
                <SideImage />
            </div>
            <div className="flex flex-col justify-center items-center py-0 px-28 absolute w-1/2 h-full right-0 top-0 bg-color-greyScale/100 rounded-s-xl">
                <div className="flex flex-col w-full">
                    <h1 className="font-L-semibold text-color-primary/default_900">
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
                <h3 className="px-3 py-0 font-S-bold text-color-greyScale/950">
                    ou continue com
                </h3>
                <div className="flex flex-row w-full justify-between">
                    <SocialLoginButton Icon={discordLogo} title="Discord" />
                    <SocialLoginButton Icon={googleLogo} title="Google" />
                </div>
            </div>
        </section>
    );
}
