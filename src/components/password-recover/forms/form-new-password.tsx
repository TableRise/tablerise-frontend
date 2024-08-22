'use client'
import { useForm } from "react-hook-form"
import { newPasswordSchema, NewPasswordSchema } from "./schemas/form-new-password-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import Form from "./Form"
import { useState } from "react"

export default function FormNewPassword() {
    const [newPassVisible, setNewPassVisible] = useState(false);
    const [confirmPassVisible, setConfirmPassVisible] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<NewPasswordSchema>({
        resolver: zodResolver(newPasswordSchema),
    })

    const consoleNewPassword = (data: NewPasswordSchema) => {
        console.log(data);
    }

    return (
        <form onSubmit={handleSubmit(consoleNewPassword)}>
            <Form.Label id='newPassword'>
                Nova senha
                <div
                    className="flex items-center justify-center relative"
                    style={{ marginBottom: errors.newPassword? '0rem' : '1.5rem' }}
                >
                    <Form.Input
                        {...register('newPassword')}
                        style={{ marginBottom: '0px' }}
                        error={errors.newPassword}
                        type={newPassVisible ? 'text' : 'password'}
                        placeholder="Insira a sua nova senha"
                        id='newPassword'
                    >
                    </Form.Input>
                    <div
                        onClick={() => setNewPassVisible(!newPassVisible)}
                        className="absolute w-6 h-6 right-4 bg-color-greyScale/500"
                    />
                </div>
            </Form.Label>
            {errors.newPassword &&
                <Form.Span>
                    {errors.newPassword.message}
                </Form.Span>
            }

            <Form.Label id='confirmPassword'>
                Confirmar
                <div
                    className="flex items-center justify-center relative"
                    style={{ marginBottom: errors.confirmPassword? '0rem' : '1.5rem' }}
                >
                    <Form.Input
                        {...register('confirmPassword')}
                        error={errors.confirmPassword}
                        style={{ marginBottom: '0px' }}
                        type={confirmPassVisible ? 'text' : 'password'}
                        placeholder="Confirme a nova senha"
                        id='confirmPassword'
                    />
                    <div
                        onClick={() => setConfirmPassVisible(!confirmPassVisible)}
                        className="absolute w-6 h-6 right-4 bg-color-greyScale/500"
                    />
                </div>
            </Form.Label>

            {errors.confirmPassword &&
                <Form.Span>
                    {errors.confirmPassword.message}
                </Form.Span>
            }

            <Form.ButtonSubmit>
                Confirmar
            </Form.ButtonSubmit>

            <Form.ButtonCancel>
                Cancelar
            </Form.ButtonCancel>
        </form>
    )
}