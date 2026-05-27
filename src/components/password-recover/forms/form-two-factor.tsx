'use client';
import Form from './Form';
import { useForm } from 'react-hook-form';
import { twoFactorSchema, TwoFactorSchema } from './schemas/form-two-factor-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext } from 'react';
import RecoverPasswordContext from '@/context/RecoverPasswordContext';
import { useRouter } from 'next/navigation';
import {
    handleOtpKeyDown,
    handleOtpAutoAdvance,
    handleOtpPaste,
} from '@/utils/otpInputHelpers';

export default function FormTwoFactor() {
    const router = useRouter();

    const num6 = new Array(6).fill('');

    const { setCode, setLoading, loading } = useContext(RecoverPasswordContext);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        setError,
    } = useForm<TwoFactorSchema>({
        resolver: zodResolver(twoFactorSchema),
    });

    const onPasteFilled = (chars: string[]) => {
        chars.forEach((char, idx) => {
            const input = document.getElementById(
                `fild${idx}`
            ) as HTMLInputElement | null;
            if (input) {
                input.value = char;
                setValue(`fild${idx}` as `fild${1}`, char);
            }
        });
    };

    const sendCode = async (data: TwoFactorSchema) => {
        const code = Object.values(data).join('').toUpperCase();
        setLoading(true);

        try {
            await setCode(code);
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
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
                <div className="form-opts-inputs">
                    {num6.map((_, index) => (
                        <input
                            {...register(
                                `fild${index}` as `fild${0 | 1 | 2 | 3 | 4 | 5}`
                            )}
                            id={`fild${index}`}
                            key={index}
                            type="text"
                            maxLength={1}
                            onPaste={(e) => handleOtpPaste(e, 6, onPasteFilled)}
                            onKeyDown={(e) =>
                                handleOtpKeyDown(e, index, 'fild', 'alphanumeric')
                            }
                            onInput={(e) => handleOtpAutoAdvance(e, index, 'fild')}
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
                {errors.fild0 && <Form.Span>{errors.fild0.message}</Form.Span>}
            </Form.Label>

            <div className="container-button">
                <Form.ButtonSubmit loading={loading}>Confirmar</Form.ButtonSubmit>

                <Form.ButtonCancel onClick={() => router.push('/password-recover')}>
                    Cancelar
                </Form.ButtonCancel>
            </div>
        </form>
    );
}
