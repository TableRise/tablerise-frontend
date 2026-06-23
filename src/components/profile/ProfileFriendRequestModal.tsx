'use client';

import { useState } from 'react';
import LoadingDots from '@/components/common/LoadingDots';
import '@/components/profile/styles/ProfileActionModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

type ProfileFriendRequestModalProps = {
    recipientLabel: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
};

export default function ProfileFriendRequestModal({
    recipientLabel,
    onClose,
    onConfirm,
}: ProfileFriendRequestModalProps): JSX.Element {
    useBodyScrollLock();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        setSubmitting(true);
        setError('');

        try {
            await onConfirm();
        } catch (confirmError: Error | any) {
            setError(
                confirmError?.message ??
                    'Não foi possivel enviar a solicitação de amizade'
            );
            setSubmitting(false);
        }
    };

    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card"
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="profile-action-modal-title font-L-semibold">
                    Enviar solicitação
                </h1>
                <p className="profile-action-modal-description font-XS-regular">
                    Deseja enviar uma solicitação de amizade para {recipientLabel}?
                </p>

                {error ? (
                    <span className="font-XXS-regular profile-action-modal-error">
                        {error}
                    </span>
                ) : null}

                <div className="profile-action-modal-buttons">
                    <button
                        type="button"
                        onClick={() => {
                            void handleConfirm();
                        }}
                        disabled={submitting}
                        className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                    >
                        {submitting ? (
                            <LoadingDots label="Enviando solicitação" />
                        ) : (
                            'Enviar solicitação'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="font-S-bold form-button-cancel button-L-fill w-full"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
