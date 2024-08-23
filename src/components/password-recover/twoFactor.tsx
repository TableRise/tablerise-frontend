import Form from "./forms/Form";
import FormTwoFactor from "./forms/form-two-factor";

export default function TwoFactor() {
    return (
        <div>
            <Form.Title>
                Verificação de duas etapas
            </Form.Title>
            <Form.Description>
                Enviamos um e-mail com código de verificação para user@email.com.
            </Form.Description>

            <FormTwoFactor />
        </div>
    )
}