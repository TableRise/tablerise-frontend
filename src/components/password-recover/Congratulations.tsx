import Form from "./forms/Form";

export default function Congratulation() {
    return (
        <div>
            <Form.Title>
                Parabéns!
            </Form.Title>
            <Form.Description>
                Você recuperou a sua senha
            </Form.Description>

            <Form.ButtonSubmit>
                Iniciar sessão
            </Form.ButtonSubmit>
            <Form.ButtonCancel>
                Voltar
            </Form.ButtonCancel>
        </div>
    )
}