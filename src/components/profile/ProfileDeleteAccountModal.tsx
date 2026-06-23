'use client';

import React from 'react';
import LoadingDots from '@/components/common/LoadingDots';
import { deleteUser } from '@/server/users/delete-user';
import { postLogout } from '@/server/users/logout';
import '@/components/profile/styles/ProfileActionModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

type ProfileDeleteAccountModalProps = {
    userId: string;
    onClose: () => void;
    onDeleted: () => void;
};

export default function ProfileDeleteAccountModal({
    userId,
    onClose,
    onDeleted,
}: ProfileDeleteAccountModalProps): JSX.Element {
    useBodyScrollLock();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleDelete = async () => {
        setLoading(true);
        setError('');

        try {
            await deleteUser(userId);
            localStorage.removeItem('userLogged');

            try {
                await postLogout();
            } catch {
                // Ignore logout failures after a successful deletion.
            }

            onDeleted();
        } catch (submitError: Error | any) {
            setError(submitError?.message ?? '*Não foi possivel deletar a conta agora.');
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
                    Deletar conta
                </h1>
                <p className="profile-action-modal-description font-XS-regular">
                    Tem certeza que deseja deletar sua conta? Esta ação e permanente e não
                    pode ser desfeita.
                </p>

                <div className="profile-action-modal-buttons">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                            void handleDelete();
                        }}
                        className="font-S-bold button-L-fill profile-action-modal-button-danger w-full"
                    >
                        {loading ? <LoadingDots label="Excluindo conta" /> : 'Confirmar'}
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
            </div>
        </div>
    );
}
