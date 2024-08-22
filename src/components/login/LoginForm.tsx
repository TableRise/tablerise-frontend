'use client'
import { useState } from 'react';
import Input from './input';
import Link from 'next/link';
import { api } from '@/server/users/examples';
import { userData } from '@/types/login/types';

export default function Form() {
    const [showPass, setShowPass] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [userEmail, setEmail] = useState<string>('');
    const [userPassword, setPassword] = useState<string>('');

    function validateInput(email: string, password: string): boolean {
        const MIN_LENGTH_PASS = 6;
        const validHas: RegExp = /^[_a-z0-9-]+(\.[_a-z0-9-]+)@[a-z0-9-]+(\.[a-z0-9-]+)(\.[a-z]{2, 4})$/;

        if (!validHas.test(email) || (password.length < MIN_LENGTH_PASS)) {
            return false
        }
        return true
    }

    async function handleLogin(data: userData): Promise<string> {
        const isValid: boolean = validateInput(data.userEmail, data.userPassword)
        console.log('api.post(data.userEmail, data.userPassword)')
        if (isValid) {
            const response = await api.post(data.userEmail, data.userPassword);
            console.log(response);
        }
        return ('dados inválidos. login falha');
    }

    return (
        <main>
            <div id='form-title'>
                <p>Entrar</p>
                <span>Não possui uma conta? <Link href={'/register'} />Criar conta!</span>
            </div>
            <form onSubmit={(event) => { event.preventDefault() }}>
                <Input type='email' name='E-mail' placeholder='Insira o seu e-mail' id='emailInput' onChange={setEmail} />
                <Input type='password' name='password' placeholder='Insira a sua senha' id='passwordInput' onChange={setPassword} />
                <a href='#'>Esqueceu a senha?</a> {/* levar p reset de senha */}
                <button type='button' onClick={() => handleLogin({ userEmail, userPassword })}>Entrar</button>
                {/* salvar user e token no localstorage e redirecionar p home */}
            </form>
        </main>
    )
};