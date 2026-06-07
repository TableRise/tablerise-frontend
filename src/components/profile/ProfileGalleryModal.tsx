'use client';

import { useState } from 'react';
import MatchImageHighlightViewerModal from '@/components/match/MatchImageHighlightViewerModal';
import type { ImageObject } from '@/types/shared/general';
import '@/components/profile/styles/ProfileActionModal.css';

type ProfileGalleryModalProps = {
    images: ImageObject[];
    onClose: () => void;
};

export default function ProfileGalleryModal({
    images,
    onClose,
}: ProfileGalleryModalProps): JSX.Element {
    const [selectedImage, setSelectedImage] = useState<ImageObject | null>(null);

    return (
        <>
            <div className="profile-action-modal-overlay">
                <div
                    className="profile-action-modal-card profile-action-modal-card--gallery-picker"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="profile-gallery-picker__header">
                        <div className="profile-gallery-picker__copy">
                            <h1 className="profile-action-modal-title font-L-semibold">
                                Galeria do perfil
                            </h1>
                            <p className="profile-action-modal-description font-XS-regular">
                                Todas as imagens enviadas para o seu perfil ficam salvas
                                aqui.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="profile-gallery-picker__close"
                            aria-label="Fechar"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {images.length === 0 ? (
                        <div className="profile-gallery-picker__empty">
                            <p className="font-S-regular text-color-greyScale/200">
                                Nenhuma imagem encontrada na galeria.
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
                                        onClick={() => setSelectedImage(image)}
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

            {selectedImage ? (
                <MatchImageHighlightViewerModal
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            ) : null}
        </>
    );
}
