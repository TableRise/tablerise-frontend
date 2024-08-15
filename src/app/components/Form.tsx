export default function Form() {
    const MAX_LENGTH_EMAIL = 30;
    const MAX_LENGTH_PASS = 50;
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
                    <input type='email' maxLength={MAX_LENGTH_EMAIL} placeholder="Insira o seu e-mail" />
                    {/* limitar e validar */}
                </div>
                <div>
                    <label htmlFor='pField' />Senha
                    <input type='password' maxLength={MAX_LENGTH_PASS} placeholder="Insira a sua senha" /> <i></i>
                    {/* limitar e validar */}
                </div>
                <a href="#">Esqueceu a senha?</a> {/* levar p reset de senha */}
                <button type='button'>Entrar</button>
                {/* salvar user e token no localstorage e redirecionar p home */}
            </form>
        </main>
    )
};
