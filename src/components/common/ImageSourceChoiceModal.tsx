'use client';

import '@/components/profile/styles/ProfileActionModal.css';

type ImageSourceChoiceModalProps = {
    title?: string;
    description?: string;
    onClose: () => void;
    onSelectLocal: () => void;
    onSelectGallery: () => void;
};

export default function ImageSourceChoiceModal({
    title = 'Selecionar imagem',
    description = 'Escolha como deseja adicionar a imagem.',
    onClose,
    onSelectLocal,
    onSelectGallery,
}: ImageSourceChoiceModalProps): JSX.Element {
    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card"
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="profile-action-modal-title font-L-semibold">{title}</h1>
                <p className="profile-action-modal-description font-XS-regular">
                    {description}
                </p>

                <div className="profile-action-modal-buttons">
                    <button
                        type="button"
                        onClick={onSelectLocal}
                        className="font-S-bold button-L-fill profile-action-modal-button-option bg-color-primary/default_900 text-color-greyScale/100 w-full"
                    >
                        Selecionar do dispositivo
                    </button>
                    <button
                        type="button"
                        onClick={onSelectGallery}
                        className="font-S-bold button-L-fill profile-action-modal-button-option bg-color-primary/default_900 text-color-greyScale/100 w-full"
                    >
                        Selecionar da galeria
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="font-S-bold form-button-cancel button-L-fill profile-action-modal-button-subtle w-full"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
