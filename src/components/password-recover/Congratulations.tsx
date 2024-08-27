'use client';
import { useRouter } from 'next/navigation';
import Form from './forms/Form';

export default function Congratulation() {
    const router = useRouter();

    return (
        <div>
            <Form.Title>Parabéns!</Form.Title>
            <Form.Description>Você recuperou a sua senha</Form.Description>

            <Form.ButtonSubmit onClick={() => router.push('/')}>
                Iniciar sessão
            </Form.ButtonSubmit>
            <Form.ButtonCancel onClick={() => router.push('/password-recover')}>
                Voltar
            </Form.ButtonCancel>
        </div>
    );
}
