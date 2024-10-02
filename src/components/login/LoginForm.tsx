'use client';
import { useState } from 'react';
import Input from './input';
import { userData } from '@/types/login/types';
import { postLogin } from '@/server/users/api';
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { useRouter } from 'next/navigation';
import validateInput from '@/utils/validateLoginFields';

export default function Form() {
    //const [showPass, setShowPass] = useState<boolean>(false);
    //const [loading, setLoading] = useState<boolean>(false);
    const [userEmail, setEmail] = useState<string>('');
    const [userPassword, setPassword] = useState<string>('');

    const router = useRouter();

    async function handleLogin(data: userData): Promise<void | RequestCookies> {
        const { userEmail, userPassword } = data;
        const isValid: void | boolean = validateInput(userEmail, userPassword);
        if (isValid) {
            try {
                const login = await postLogin(data);
                localStorage.setItem('login', login);
                router.push('/');
            } catch (error: any) {
                return error;
            }
        }
    }

    return (
        <main className="h-300 w-5/6">
            <form
                className="flex flex-col w-4/4"
                onSubmit={(event) => {
                    event.preventDefault();
                }}
            >
                <Input
                    type="email"
                    name="E-mail"
                    placeholder="Insira o seu e-mail"
                    id="emailInput"
                    onChange={setEmail}
                />
                <Input
                    type="password"
                    name="Password"
                    placeholder="Insira a sua senha"
                    id="passwordInput"
                    onChange={setPassword}
                />
                <a href="#">Esqueceu a senha?</a> {/* levar p reset de senha */}
                <button
                    type="button"
                    onClick={() => handleLogin({ userEmail, userPassword })}
                >
                    Entrar
                </button>
            </form>
        </main>
    );
}
