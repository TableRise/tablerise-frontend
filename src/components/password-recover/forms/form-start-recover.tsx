'use client'
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { emailSchema, EmailSchema } from "./schemas/form-start-recover-schema";
import Form from "./Form";

export default function FormStartRecover() {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<EmailSchema>({
        resolver: zodResolver(emailSchema),
    });

    const sendEmail = async ({ email }: EmailSchema) => {
        console.log(email);
    }


    return (
        <form onSubmit={handleSubmit(sendEmail)}>
            <Form.Input
                {...register('email')}
                error={errors.email}
                type="email"
                placeholder="Insira o seu e-mail"
            />

            {errors.email &&
                <Form.Span>
                    {errors.email.message}
                </Form.Span>
            }

            <div className="container-button">
                <Form.ButtonSubmit>
                    Enviar
                </Form.ButtonSubmit>

                <Form.ButtonCancel>
                    Cancelar
                </Form.ButtonCancel>
            </div>
        </form>
    )
}