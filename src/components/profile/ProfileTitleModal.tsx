'use client';

import { FormEvent, useState } from 'react';
import LoadingDots from '@/components/common/LoadingDots';
import {
    getProfileTitleTextStyle,
    titleEntriesByGender,
} from '@/components/profile/profilePageHelpers';
import { updateUser } from '@/server/users/update-user';
import '@/components/profile/styles/ProfileActionModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

type ProfileTitleModalProps = {
    userId: string;
    gender: 'male' | 'female';
    availableTitles: string[];
    selectedTitle: string;
    onClose: () => void;
    onSaved: () => void | Promise<void>;
};

export default function ProfileTitleModal({
    userId,
    gender,
    availableTitles,
    selectedTitle,
    onClose,
    onSaved,
}: ProfileTitleModalProps): JSX.Element {
    useBodyScrollLock();
    const [value, setValue] = useState(selectedTitle);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const titleEntries = titleEntriesByGender[gender];
    const selectedTitleType =
        titleEntries.find((entry) => entry.title === value)?.type ?? 'bronze';

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedValue = value.trim();

        if (!trimmedValue || !availableTitles.includes(trimmedValue)) {
            setError('*Selecione um titulo valido para continuar.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await updateUser(userId, { title: trimmedValue });
            await onSaved();
        } catch (submitError: Error | any) {
            setError(submitError?.message ?? '*Não foi possivel atualizar o titulo.');
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
                    Trocar Titulo
                </h1>
                <p className="profile-action-modal-description font-XS-regular">
                    Escolha um titulo desbloqueado para aparecer no seu perfil.
                </p>

                <form className="profile-action-modal-form" onSubmit={handleSubmit}>
                    <label className="profile-action-modal-field">
                        <span className="font-S-bold profile-action-modal-label">
                            Titulo atual
                        </span>
                        <select
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            disabled={loading}
                            className="profile-action-modal-select font-S-bold"
                        >
                            {availableTitles.map((title) => (
                                <option key={title} value={title}>
                                    {title}
                                </option>
                            ))}
                        </select>
                    </label>

                    <p
                        className={`font-S-bold profile-hero__title-line profile-hero__title-line--${selectedTitleType} text-center`}
                        style={getProfileTitleTextStyle(selectedTitleType)}
                    >
                        {value}
                    </p>

                    <span className="font-XXS-regular profile-action-modal-helper">
                        Apenas os titulos da sua faixa de nivel atual ficam disponiveis.
                    </span>

                    <div className="profile-action-modal-buttons">
                        <button
                            type="submit"
                            disabled={loading}
                            className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                        >
                            {loading ? (
                                <LoadingDots label="Salvando titulo" />
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
