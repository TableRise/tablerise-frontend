'use client';

import '@/components/profile/styles/ProfileActionModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

type ProfileFlowWarningModalProps = {
    flowLabel: string;
    onClose: () => void;
    onConfirm: () => void;
};

export default function ProfileFlowWarningModal({
    flowLabel,
    onClose,
    onConfirm,
}: ProfileFlowWarningModalProps): JSX.Element {
    useBodyScrollLock();
    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card"
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="profile-action-modal-title font-L-semibold">Atenção</h1>
                <p className="profile-action-modal-description font-XS-regular">
                    Uma vez iniciado o processo de {flowLabel}, por favor não interrompa
                    nenhum dos passos.
                </p>

                <div className="profile-action-modal-buttons">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                    >
                        Continuar
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="font-S-bold form-button-cancel button-L-fill w-full"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
