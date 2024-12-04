'use client'
import { useForm } from "react-hook-form"
import { newPasswordSchema, NewPasswordSchema } from "./schemas/form-new-password-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import Form from "./Form"
import { useContext, useState } from "react"
import { useRouter } from "next/navigation"
import RecoverPasswordContext from "@/context/RecoverPasswordContext"
import VisibilityOff from "@/components/icons/password-recover/Visibility-off"
import Visibility from "@/components/icons/password-recover/Visibility"

export default function FormNewPassword() {
    const { updatePassword } = useContext(RecoverPasswordContext);

    const router = useRouter();

    const [newPassVisible, setNewPassVisible] = useState(false);
    const [confirmPassVisible, setConfirmPassVisible] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm<NewPasswordSchema>({
        resolver: zodResolver(newPasswordSchema),
    })

    const sendNewPassword = async ({ newPassword }: NewPasswordSchema) => {
        try {
            await updatePassword(newPassword);

            router.push('/password-recover/congratulations')
        } catch (error: any) {
            setError('confirmPassword',
                {
                    type: 'manual',
                    message: `${error.message}`
                }
            );
        }
    }

    return (
        <form onSubmit={handleSubmit(sendNewPassword)}>
            <Form.Label id='newPassword'>
                Nova senha
                <div
                    className="flex items-center justify-center relative"
                    style={{ marginBottom: errors.newPassword ? '0rem' : '1.5rem' }}
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
                    <button
                        type="button"
                        onClick={() => setNewPassVisible(!newPassVisible)}
                        className="absolute w-6 h-6 right-4 text-color-greyScale/500"
                    >
                        {newPassVisible ? <VisibilityOff /> : <Visibility />}
                    </button>
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
                    style={{ marginBottom: errors.confirmPassword ? '0rem' : '1.5rem' }}
                >
                    <Form.Input
                        {...register('confirmPassword')}
                        error={errors.confirmPassword}
                        style={{ marginBottom: '0px' }}
                        type={confirmPassVisible ? 'text' : 'password'}
                        placeholder="Confirme a nova senha"
                        id='confirmPassword'
                    />
                    <button
                        type="button"
                        onClick={() => setConfirmPassVisible(!confirmPassVisible)}
                        className="absolute w-6 h-6 right-4 text-color-greyScale/500"
                    >
                        {confirmPassVisible ? <VisibilityOff /> : <Visibility />}
                    </button>
                </div>
            </Form.Label>

            {errors.confirmPassword &&
                <Form.Span>
                    {errors.confirmPassword.message}
                </Form.Span>
            }

            <div className="container-button">
                <Form.ButtonSubmit>
                    Confirmar
                </Form.ButtonSubmit>

                <Form.ButtonCancel onClick={() => router.push('/password-recover')}>
                    Cancelar
                </Form.ButtonCancel>
            </div>
        </form>
    )
}