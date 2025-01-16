import Form from './forms/Form';
import FormNewPassword from './forms/form-new-password';

export default function NewPassword() {
    return (
        <div>
            <Form.Title>Recuperar senha</Form.Title>
            <Form.Description>
                Escolha uma senha forte. Ela precisa ter no minimo x caracteres.
            </Form.Description>

            <FormNewPassword />
        </div>
    );
}
