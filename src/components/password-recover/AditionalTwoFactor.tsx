import Form from "./forms/Form";
import FormTwoFactor from "./forms/form-two-factor";

export default function AditionalTwoFactor() {
    return (
        <div>
            <Form.Title>
                Verificação de segurança adicional
            </Form.Title>
            <Form.Description>
                Para garantir a segurança da sua conta, uma verificação adicional é necessária.
            </Form.Description>

            <FormTwoFactor />
        </div>
    )
}