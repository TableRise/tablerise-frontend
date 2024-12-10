'use client';
import { useForm } from 'react-hook-form';
import {
    secretQuestionSchema,
    SecretQuestionSchema,
} from './schemas/form-secret-question-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Form from './Form';
import { useContext } from 'react';
import RecoverPasswordContext from '@/context/RecoverPasswordContext';
import { useRouter } from 'next/navigation';

export default function FormSecretQuestion() {
    const { sendSecretQuestion, userVerify } = useContext(RecoverPasswordContext);

    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<SecretQuestionSchema>({
        resolver: zodResolver(secretQuestionSchema),
    });

    const sendAnswer = async ({ secretAnswer }: SecretQuestionSchema) => {
        try {
            await sendSecretQuestion(secretAnswer);
        } catch (error: any) {
            setError('secretAnswer', {
                type: 'manual',
                message: `${error.message}`,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(sendAnswer)}>
            <Form.Label id="secretAnswer">
                {userVerify.secretQuestion}
                <Form.Input
                    id="secretAnswer"
                    {...register('secretAnswer')}
                    type="text"
                    error={errors.secretAnswer}
                    placeholder="Insira a sua resposta secreta"
                />
            </Form.Label>

            {errors.secretAnswer && <Form.Span>{errors.secretAnswer.message}</Form.Span>}

            <div className="container-button">
                <Form.ButtonSubmit>Confirmar</Form.ButtonSubmit>

                <Form.ButtonCancel onClick={() => router.push('/password-recover')}>
                    Cancelar
                </Form.ButtonCancel>
            </div>
        </form>
    );
}
