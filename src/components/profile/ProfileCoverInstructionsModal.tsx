'use client';

import '@/components/profile/styles/ProfileActionModal.css';

type ProfileCoverInstructionsModalProps = {
    onClose: () => void;
    onConfirm: () => void;
};

export default function ProfileCoverInstructionsModal({
    onClose,
    onConfirm,
}: ProfileCoverInstructionsModalProps): JSX.Element {
    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card"
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="profile-action-modal-title font-L-semibold">
                    Instruções para capa de perfil
                </h1>
                <div className="profile-action-modal-copy">
                    <p className="profile-action-modal-description font-XS-regular">
                        Para uma melhor experiência envie uma imagem de pelo menos
                        1280x720, no formato jpg / jpeg / webp.
                    </p>
                    <p className="profile-action-modal-description font-XS-regular">
                        O formato png também é aceito mas em alguns casos pode tornar o
                        carregamento mais lento.
                    </p>
                </div>

                <div className="profile-action-modal-buttons">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                    >
                        Confirmar
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
