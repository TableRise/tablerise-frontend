import Form from './forms/Form';
import FormStartRecover from './forms/form-start-recover';

export default function StartRecover() {
    return (
        <div>
            <Form.Title>Recuperar senha</Form.Title>
            <Form.Description>
                Insira o e-mail associado à sua conta e enviaremos um e-mail com
                instruções para redefinir sua senha.
            </Form.Description>

            <FormStartRecover />
        </div>
    );
}
