'use client';
import Form from './Form';
import { useForm } from 'react-hook-form';
import { twoFactorSchema, TwoFactorSchema } from './schemas/form-two-factor-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext } from 'react';
import RecoverPasswordContext from '@/context/RecoverPasswordContext';
import { useRouter } from 'next/navigation';

export default function FormAditionalTwoFactor() {
    const router = useRouter();
    const num6 = new Array(6).fill('');

    const { twoFactor } = useContext(RecoverPasswordContext);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<TwoFactorSchema>({
        resolver: zodResolver(twoFactorSchema),
    });

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        const inputElement = e.currentTarget;

        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
            e.preventDefault(); // Impede qualquer caractere que não seja número
            return;
        }

        // Se a tecla pressionada for Backspace ou Delete e o campo estiver vazio, move para o campo anterior
        if ((e.key === 'Backspace' || e.key === 'Delete') && inputElement.value === '') {
            const previousField = document.getElementById(
                `fild${index - 1}`
            ) as HTMLInputElement | null;
            if (previousField) {
                previousField.focus();
            }
        } else if (
            inputElement.value.length === 1 &&
            e.key !== 'Backspace' &&
            e.key !== 'Delete'
        ) {
            // Limpa o campo antes de adicionar o novo valor
            inputElement.value = '';
        }
    };

    const nextInput = (e: React.FormEvent<HTMLInputElement>, index: number) => {
        const { value } = e.currentTarget;

        if (value.length === 1) {
            const nextField = document.getElementById(
                `fild${index + 1}`
            ) as HTMLInputElement | null;

            if (nextField) {
                nextField.focus();
            }
        } else if (value.length === 0 && index > 0) {
            const previousField = document.getElementById(
                `fild${index - 1}`
            ) as HTMLInputElement | null;

            if (previousField) {
                previousField.focus();
            }
        }
    };

    const consoleFormTwoFactor = async (data: TwoFactorSchema) => {
        const code = Object.values(data).join('');

        try {
            await twoFactor(code);
        } catch (error: any) {
            setError('fild0', {
                type: 'manual',
                message: `${error.message}`,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(consoleFormTwoFactor)}>
            <Form.Label>
                Insira o código de verificação, indicado em seu app de autenticação.
                <div className="flex gap-2">
                    {num6.map((_, index) => (
                        <input
                            {...register(
                                `fild${index}` as `fild${0 | 1 | 2 | 3 | 4 | 5}`
                            )}
                            id={`fild${index}`}
                            key={index}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            onKeyDown={(e) => handleKeyPress(e, index)}
                            onInput={(e) => nextInput(e, index)}
                            className={`
                                    form-opt-input
                                    ${
                                        errors.fild0
                                            ? 'input-error-light mb-0'
                                            : 'input-default-light'
                                    }
                                `}
                        />
                    ))}
                </div>
            </Form.Label>

            {errors.fild0 && <Form.Span>{errors.fild0.message}</Form.Span>}

            <div className="container-button">
                <Form.ButtonSubmit onClick={() => console.log(errors)}>
                    Confirmar
                </Form.ButtonSubmit>

                <Form.ButtonCancel onClick={() => router.push('/password-recover')}>
                    Cancelar
                </Form.ButtonCancel>
            </div>
        </form>
    );
}
