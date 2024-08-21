'use client'
import { useState } from "react";
import Input from "./input";
import { input } from "@/types/login/types";
import Link from "next/link";

export default function Form() {
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userEmail, setEmail] = useState('');
    const [userPassword, setPassword] = useState('');

    const emailProps: input = {
        type: "email",
        name: "E-mail",
        placeholder: "Insira o seu e-mail",
        id: "emailInput",
        onChange: setEmail,
    }

    const passProps: input = {
        type: "password",
        name: "password",
        placeholder: "Insira a sua senha",
        id: "passwordInput",
        onChange: setPassword,
    }

    function validateInput(email: string, password: string) {
        const MIN_LENGTH_PASS = 6;
        const validHas: RegExp =  /^[_a-z0-9-]+(\.[_a-z0-9-]+)@[a-z0-9-]+(\.[a-z0-9-]+)(\.[a-z]{2,4})$/;

        if(!validHas.test(email) || (password.length < MIN_LENGTH_PASS)) {
            return false
        }
        return true
    }

    function handleLogin(data: any) {
        const isValid = validateInput(data.userEmail, data.userPassword)
        if(isValid) {
            console.log("efetuar login")
            const response = "api.post({data}"
            return response;
        }
        console.log("dados inválidos. login falha")
    }

    return (
        <main>
            <div id="form-title">
                <p>Entrar</p>
                <span>Não possui uma conta? <Link href={'/register'} />Criar conta!</span>
            </div>
            <form onSubmit={ (event) => { event.preventDefault(), handleLogin("data") } }>
                <Input props={emailProps} onChange={setEmail}/> 
                <Input props={ passProps } onChange={setPassword} />
                <a href="#">Esqueceu a senha?</a> {/* levar p reset de senha */}
                <button type='button' onClick={(event) => handleLogin(event.target)
                }>Entrar</button>
                {/* salvar user e token no localstorage e redirecionar p home */}
            </form>
        </main>
    )
};
