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

    const { verify, loading, setLoading } = useContext(RecoverPasswordContext);

    const sendEmail = async ({ email }: EmailSchema) => {
        setLoading(true);
        try {
            await verify(email);

            reset();
            router.push('/password-recover/verify-code');
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            setError('email', {
                type: 'manual',
                message: `${error.message}`,
            });
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(sendEmail)}>
                <Form.Label>
                    <Form.Input
                        {...register('email')}
                        error={errors.email}
                        type="email"
                        placeholder="Insira o seu e-mail"
                    />

                    {errors.email && <Form.Span>{errors.email.message}</Form.Span>}
                </Form.Label>

                <div className="container-button">
                    <Form.ButtonSubmit loading={loading}>Enviar</Form.ButtonSubmit>

                    <Form.ButtonCancel onClick={() => router.push('/')}>
                        Cancelar
                    </Form.ButtonCancel>
                </div>
            </form>
        </>
    );
}
