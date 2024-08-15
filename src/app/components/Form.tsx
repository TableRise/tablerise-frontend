export default function Form() {
    return (
        <main>
            <div>
                <p>Entrar</p>
                <span>Não possui uma conta? <a href="#">Criar conta!</a></span>
                {/* levar p pag de cadastro */}
            </div>
            <form>
                <div>
                    <label htmlFor='eField' />E-mail
                    <input type='email' placeholder="Insira o seu e-mail" />
                    {/* limitar e validar */}
                </div>
                <div>
                    <label htmlFor='pField' />Senha
                    <input type='password' placeholder="Insira a sua senha" /> <i></i>
                    {/* limitar e validar */}
                </div>
                <a href="#">Esqueceu a senha?</a> {/* levar p reset de senha */}
                <button type='button'>Entrar</button>
                {/* salvar user e token no localstorage e redirecionar p home */}
            </form>
        </main>
    )
};
