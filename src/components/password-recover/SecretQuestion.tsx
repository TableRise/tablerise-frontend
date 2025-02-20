import Form from './forms/Form';
import FormSecretQuestion from './forms/form-secret-question';

export default function SecretQuestion() {
    return (
        <div>
            <Form.Title>Pergunta Secreta</Form.Title>
            <Form.Description>
                Responda corretamente a sua pergunta secreta.
            </Form.Description>

            <FormSecretQuestion />
        </div>
    );
}
