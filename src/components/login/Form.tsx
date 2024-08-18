'use client'
import { useState } from "react";
import Input from "./input";
import { input } from "@/types/login/types";

export default function Form() {
    const MAX_LENGTH_EMAIL = 30;
    const MAX_LENGTH_PASS = 50;

    const [userEmail, setEmail] = useState('');
    const [userPassword, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const userData: Object = { userEmail, userPassword };

    const emailProps: input = {
        type: "email",
        name: "E-mail",
        placeholder: "Insira o seu e-mail",
        onChange: setEmail,
        id: "emailInput",
        maxLength: MAX_LENGTH_EMAIL,
    }

    const passProps: input = {
        type: "password",
        name: "password",
        placeholder: "Insira a sua senha",
        onChange: setPassword,
        id: "passwordInput",
        maxLength: MAX_LENGTH_PASS,
    }

    return (
        <main>
            <div>
                <p>Entrar</p>
                <span>Não possui uma conta? <a href="#">Criar conta!</a></span>
                {/* levar p pag de cadastro */}
            </div>
            <form>
                <Input props={emailProps}/> 
                <Input props={ passProps } />
                <a href="#">Esqueceu a senha?</a> {/* levar p reset de senha */}
                <button type='button'>Entrar</button>
                {/* salvar user e token no localstorage e redirecionar p home */}
            </form>
        </main>
    )
};
