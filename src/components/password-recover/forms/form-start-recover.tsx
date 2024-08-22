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

    const consoleFields = (data: EmailSchema) => {
        console.log(data);
    }


    return (
        <form onSubmit={handleSubmit(consoleFields)}>
            <Form.Input
                {...register('email')}
                error={errors.email}
                placeholder="Insira o seu e-mail"
            />
            {errors.email &&
                <span className="text-red-500 font-XXS-regular">
                    {errors.email.message}
                </span>
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