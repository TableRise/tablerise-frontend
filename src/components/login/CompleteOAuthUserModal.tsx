'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postCompleteOAuthUser } from '@/server/users/complete-oauth-user';
import completeOAuthUserSchema, {
    CompleteOAuthUserPayload,
} from './schemas/CompleteOAuthUserSchema';
import Input from '@/components/common/forms/Input';
import './styles/CompleteOAuthUserModal.css';

interface CompleteOAuthUserModalProps {
    userId: string;
}

export default function CompleteOAuthUserModal({
    userId,
}: CompleteOAuthUserModalProps): JSX.Element {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm<CompleteOAuthUserPayload>({
        resolver: zodResolver(completeOAuthUserSchema),
    });

    const onSubmit = async (data: CompleteOAuthUserPayload) => {
        setError('');
        setLoading(true);
        try {
            await postCompleteOAuthUser(userId, data);
            window.location.replace(`/login-redirect?userId=${userId}`);
        } catch (err: Error | any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="complete-oauth-modal-overlay">
            <div className="complete-oauth-modal-card">
                <h1 className="complete-oauth-modal-title font-L-semibold">
                    Complete seu perfil
                </h1>
                <p className="complete-oauth-modal-description font-XS-regular">
                    Para continuar, preencha as informações abaixo.
                </p>

                <form
                    className="complete-oauth-modal-form"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <Input
                        title="Nickname"
                        inputStyle="input-default-light"
                        setter={register}
                        name="nickname"
                        type="text"
                        placeholder="Seu nickname"
                        errorMessage={errors.nickname}
                    />
                    <Input
                        title="Nome"
                        inputStyle="input-default-light"
                        setter={register}
                        name="firstName"
                        type="text"
                        placeholder="Seu nome"
                        errorMessage={errors.firstName}
                    />
                    <Input
                        title="Sobrenome"
                        inputStyle="input-default-light"
                        setter={register}
                        name="lastName"
                        type="text"
                        placeholder="Seu sobrenome"
                        errorMessage={errors.lastName}
                    />

                    <Input
                        title="Data de nascimento"
                        inputStyle="input-default-light"
                        setter={register}
                        name="birthday"
                        type="date"
                        placeholder="DD/MM/AAAA"
                        errorMessage={errors.birthday}
                    />

                    <div className="complete-oauth-modal-buttons">
                        <button
                            type="submit"
                            disabled={loading}
                            className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                        >
                            {loading ? 'Salvando...' : 'Confirmar'}
                        </button>
                        {error && (
                            <span className="font-XXS-regular text-color-support/alert">
                                {error}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => window.location.replace('/login')}
                            className="font-S-bold form-button-cancel button-L-fill w-full"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
