'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailSchema, EmailSchema } from './schemas/form-start-recover-schema';
import Form from './Form';
import { useContext } from 'react';
import RecoverPasswordContext from '@/context/RecoverPasswordContext';
import { useRouter } from 'next/navigation';

export default function FormStartRecover() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm<EmailSchema>({
        resolver: zodResolver(emailSchema),
    });

    const { verify } = useContext(RecoverPasswordContext);

    const sendEmail = async ({ email }: EmailSchema) => {
        try {
            await verify(email);

            reset();
            router.push('/password-recover/verify-code');
        } catch (error: any) {
            setError('email', {
                type: 'manual',
                message: `${error.message}`,
            });
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(sendEmail)}>
                <Form.Input
                    {...register('email')}
                    error={errors.email}
                    type="email"
                    placeholder="Insira o seu e-mail"
                />

                {errors.email && <Form.Span>{errors.email.message}</Form.Span>}

                <div className="container-button">
                    <Form.ButtonSubmit>Enviar</Form.ButtonSubmit>

                    <Form.ButtonCancel onClick={() => router.push('/')}>
                        Cancelar
                    </Form.ButtonCancel>
                </div>
            </form>
        </>
    );
}
