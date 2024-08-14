import RegisterForm from '@/components/RegisterForm';
import SideImage from '@/components/SideImage';
import SocialLoginButton from '../../components/SocialLoginButton';
import discordLogo from '../../../assets/icons/social-midia/discord.svg';
import googleLogo from '../../../assets/icons/social-midia/google.svg';
import React from 'react';

export default function Register() {
    return (
        <section className="flex h-screen">
            <div className="w-2/3">
                <SideImage />
            </div>
            <div className="flex-col w-1/3 h-full">
                <div className="flex-col">
                    <h1>Criar Conta</h1>
                    <h2>Já possui uma conta? Entrar</h2>
                </div>
                <RegisterForm />
                <h3>ou continue com</h3>
                <div className="flex">
                    <SocialLoginButton imageSrc={discordLogo} title="Discord" />
                    <SocialLoginButton imageSrc={googleLogo} title="Google" />
                </div>
            </div>
        </section>
    );
}
