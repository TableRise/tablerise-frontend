'use client';

import { FormEvent, useState } from 'react';
import LoadingDots from '@/components/common/LoadingDots';
import { updateUser } from '@/server/users/update-user';
import '@/components/profile/styles/ProfileActionModal.css';

const BIOGRAPHY_MAX_LENGTH = 300;

type ProfileBiographyModalProps = {
    userId: string;
    firstName: string;
    lastName: string;
    biography: string;
    onClose: () => void;
    onSaved: () => void | Promise<void>;
};

export default function ProfileBiographyModal({
    userId,
    firstName,
    lastName,
    biography,
    onClose,
    onSaved,
}: ProfileBiographyModalProps): JSX.Element {
    const [firstNameValue, setFirstNameValue] = useState(firstName);
    const [lastNameValue, setLastNameValue] = useState(lastName);
    const [value, setValue] = useState(biography);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedFirstName = firstNameValue.trim();
        const trimmedLastName = lastNameValue.trim();
        const trimmedValue = value.trim();

        if (trimmedFirstName.length < 2) {
            setError('*O nome deve ter no minimo 2 caracteres.');
            return;
        }

        if (trimmedLastName.length < 2) {
            setError('*O sobrenome deve ter no minimo 2 caracteres.');
            return;
        }

        if (!trimmedValue) {
            setError('*Digite uma biografia para continuar.');
            return;
        }

        if (trimmedValue.length > BIOGRAPHY_MAX_LENGTH) {
            setError('*A biografia deve ter no maximo 300 caracteres.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await updateUser(userId, {
                firstName: trimmedFirstName,
                lastName: trimmedLastName,
                biography: trimmedValue,
            });
            await onSaved();
        } catch (submitError: Error | any) {
            setError(
                submitError?.message ??
                    '*Nao foi possivel atualizar a biografia e o nome.'
            );
            setLoading(false);
        }
    };

    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card"
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="profile-action-modal-title font-L-semibold">
                    Atualizar biografia e nome
                </h1>
                <p className="profile-action-modal-description font-XS-regular">
                    Atualize seu nome e escreva uma biografia para aparecer no seu perfil.
                </p>

                <form className="profile-action-modal-form" onSubmit={handleSubmit}>
                    <label className="profile-action-modal-field">
                        <span className="font-S-bold profile-action-modal-label">
                            Nome
                        </span>
                        <input
                            type="text"
                            value={firstNameValue}
                            onChange={(event) => setFirstNameValue(event.target.value)}
                            className={`profile-action-modal-input font-S-regular ${
                                error ? 'profile-action-modal-input--error' : ''
                            }`}
                            placeholder="Seu nome"
                        />
                    </label>

                    <label className="profile-action-modal-field">
                        <span className="font-S-bold profile-action-modal-label">
                            Sobrenome
                        </span>
                        <input
                            type="text"
                            value={lastNameValue}
                            onChange={(event) => setLastNameValue(event.target.value)}
                            className={`profile-action-modal-input font-S-regular ${
                                error ? 'profile-action-modal-input--error' : ''
                            }`}
                            placeholder="Seu sobrenome"
                        />
                    </label>

                    <label className="profile-action-modal-field">
                        <span className="font-S-bold profile-action-modal-label">
                            Biografia
                        </span>
                        <textarea
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            maxLength={BIOGRAPHY_MAX_LENGTH}
                            className={`profile-action-modal-textarea font-S-regular ${
                                error ? 'profile-action-modal-textarea--error' : ''
                            }`}
                            placeholder="Conte um pouco sobre voce, suas aventuras ou seu estilo de jogo."
                            rows={6}
                        />
                        <span className="font-XXS-regular text-color-greyScale/500">
                            {value.length}/{BIOGRAPHY_MAX_LENGTH}
                        </span>
                    </label>

                    <div className="profile-action-modal-buttons">
                        <button
                            type="submit"
                            disabled={loading}
                            className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                        >
                            {loading ? (
                                <LoadingDots label="Salvando perfil" />
                            ) : (
                                'Confirmar'
                            )}
                        </button>
                        {error ? (
                            <span className="font-XXS-regular profile-action-modal-error">
                                {error}
                            </span>
                        ) : null}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
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
