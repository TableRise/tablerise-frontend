'use client';

import type { ImageObject } from '@/types/shared/general';
import '@/components/profile/styles/ProfileActionModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

type UserGalleryPickerModalProps = {
    title?: string;
    description?: string;
    images: ImageObject[];
    emptyMessage?: string;
    onClose: () => void;
    onSelect: (image: ImageObject) => void;
};

export default function UserGalleryPickerModal({
    title = 'Selecionar da galeria',
    description = 'Escolha uma imagem salva na sua galeria.',
    images,
    emptyMessage = 'Nenhuma imagem disponivel na galeria.',
    onClose,
    onSelect,
}: UserGalleryPickerModalProps): JSX.Element {
    useBodyScrollLock();
    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card profile-action-modal-card--gallery-picker"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="profile-gallery-picker__header">
                    <div className="profile-gallery-picker__copy">
                        <h1 className="profile-action-modal-title font-L-semibold">
                            {title}
                        </h1>
                        <button
                            type="button"
                            onClick={onClose}
                            className="profile-gallery-picker__close"
                            aria-label="Fechar"
                        >
                            X
                        </button>
                    </div>
                    <div className="profile-gallery-description__modal font-XS-regular">
                        {description}
                    </div>
                </div>

                {images.length === 0 ? (
                    <div className="profile-gallery-picker__empty">
                        <p className="font-S-regular text-color-greyScale/200">
                            {emptyMessage}
                        </p>
                    </div>
                ) : (
                    <div className="profile-gallery-picker__grid">
                        {images.map((image, index) => {
                            const imageId = image.id ?? image.link ?? `${index}`;

                            return (
                                <button
                                    key={imageId}
                                    type="button"
                                    className="profile-gallery-picker__item"
                                    onClick={() => onSelect(image)}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={image.link}
                                        alt={image.title || `Imagem ${index + 1}`}
                                        className="profile-gallery-picker__image"
                                    />
                                    <span className="font-XXS-bold profile-gallery-picker__label">
                                        {image.title || `Imagem ${index + 1}`}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
