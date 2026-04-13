'use client';
import Form from './Form';
import { useForm } from 'react-hook-form';
import { twoFactorSchema, TwoFactorSchema } from './schemas/form-two-factor-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext } from 'react';
import RecoverPasswordContext from '@/context/RecoverPasswordContext';
import { useRouter } from 'next/navigation';
import { handleOtpKeyDown, handleOtpAutoAdvance } from '@/utils/otpInputHelpers';

export default function FormAditionalTwoFactor() {
    const router = useRouter();
    const num6 = new Array(6).fill('');

    const { twoFactor, loading, setLoading } = useContext(RecoverPasswordContext);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<TwoFactorSchema>({
        resolver: zodResolver(twoFactorSchema),
    });

    const consoleFormTwoFactor = async (data: TwoFactorSchema) => {
        const code = Object.values(data).join('');
        setLoading(true);

        try {
            await twoFactor(code);
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
                            onKeyDown={(e) =>
                                handleOtpKeyDown(e, index, 'fild', 'numeric')
                            }
                            onInput={(e) => handleOtpAutoAdvance(e, index, 'fild')}
                            className={`form-opt-input ${
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
