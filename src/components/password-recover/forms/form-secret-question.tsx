'use client'
import { useForm } from "react-hook-form";
import { secretQuestionSchema, SecretQuestionSchema } from "./schemas/form-secret-question-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Form from "./Form";
// import './styles/Form.css'

export default function FormSecretQuestion() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SecretQuestionSchema>({
        resolver: zodResolver(secretQuestionSchema),
    });

    const consoleSecret = (data: SecretQuestionSchema) => {
        console.log(data);
    }

    return (
        <form onSubmit={handleSubmit(consoleSecret)}>
            <Form.Label id="secretAnswer">
                Qual é o nome da tia avó da sua professora?
                <Form.Input
                    id="secretAnswer"
                    {...register('secretAnswer')}
                    error={errors.secretAnswer}
                    placeholder="Insira a sua resposta secreta"
                />
            </Form.Label>

            <div className="container-button">
                <Form.ButtonSubmit>
                    Confirmar
                </Form.ButtonSubmit>

                <Form.ButtonCancel>
                    Cancelar
                </Form.ButtonCancel>
            </div>
        </form>
    )
}