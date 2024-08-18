'use client'
import { useState } from "react";
import Input from "./input";
import { input } from "@/types/login/types";

export default function Form() {
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const emailProps: input = {
        type: "email",
        name: "E-mail",
        placeholder: "Insira o seu e-mail",
        id: "emailInput",
    }

    const passProps: input = {
        type: "password",
        name: "password",
        placeholder: "Insira a sua senha",
        id: "passwordInput",
    }

    function handleLogin(data: any) {
        //PEGAR DADOS DO CONTEXT
        "response = api.post({data}"
        "if response nao for ok return (erro)"
    }

    return (
        <main>
            <div id="form-title">
                <p>Entrar</p>
                <span>Não possui uma conta? <a href="#">Criar conta!</a></span>
                {/* levar p pag de cadastro */}
            </div>
            <form onSubmit={ (event) => { event.preventDefault(), handleLogin("data") } }>
                <Input props={emailProps}/> 
                <Input props={ passProps } />
                <a href="#">Esqueceu a senha?</a> {/* levar p reset de senha */}
                <button type='button' onClick={(event) => handleLogin(event.target)
                }>Entrar</button>
                {/* salvar user e token no localstorage e redirecionar p home */}
            </form>
        </main>
    )
};
