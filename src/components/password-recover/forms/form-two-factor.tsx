'use client';
import Form from './Form';
import { useForm } from 'react-hook-form';
import { twoFactorSchema, TwoFactorSchema } from './schemas/form-two-factor-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext } from 'react';
import RecoverPasswordContext from '@/context/RecoverPasswordContext';
import { useRouter } from 'next/navigation';

export default function FormTwoFactor() {
    const router = useRouter();

    const num6 = new Array(6).fill('');

    const { setCode } = useContext(RecoverPasswordContext);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        setError,
    } = useForm<TwoFactorSchema>({
        resolver: zodResolver(twoFactorSchema),
    });

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
        e.preventDefault();
        const clipboardData = e.clipboardData.getData('Text');
        const inputs = document.querySelectorAll('input');

        clipboardData.split('').forEach((char, idx) => {
            if (inputs[idx]) {
                (inputs[idx] as HTMLInputElement).value = char;
                setValue(`fild${idx}` as `fild${1}`, char); // Atualiza o valor do formulário
            }
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        const inputElement = e.currentTarget;

        if (!/^[a-zA-Z0-9]$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
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

    const sendCode = async (data: TwoFactorSchema) => {
        const code = Object.values(data).join('').toUpperCase();

        try {
            await setCode(code);
        } catch (error: any) {
            setError('fild0', {
                type: 'manual',
                message: `${error.message}`,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(sendCode)}>
            <Form.Label>
                Insira o código de verificação, indicado em seu e-mail.
                <div className="flex justify-center gap-2">
                    {num6.map((_, index) => (
                        <input
                            {...register(
                                `fild${index}` as `fild${0 | 1 | 2 | 3 | 4 | 5}`
                            )}
                            id={`fild${index}`}
                            key={index}
                            type="text"
                            maxLength={1}
                            onPaste={(e) => handlePaste(e, index)}
                            onKeyDown={(e) => handleKeyPress(e, index)}
                            onInput={(e) => nextInput(e, index)}
                            className={`
                                    form-opt-input font-XS-regular
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
                <Form.ButtonSubmit>Confirmar</Form.ButtonSubmit>

                <Form.ButtonCancel onClick={() => router.push('/password-recover')}>
                    Cancelar
                </Form.ButtonCancel>
            </div>
        </form>
    );
}
