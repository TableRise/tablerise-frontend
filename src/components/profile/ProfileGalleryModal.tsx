'use client';

import { useState } from 'react';
import Image from 'next/image';
import TrashSvg from '@assets/icons/sys/trash.svg?url';
import MatchImageHighlightViewerModal from '@/components/match/MatchImageHighlightViewerModal';
import type { ImageObject } from '@/types/shared/general';
import '@/components/profile/styles/ProfileActionModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

type ProfileGalleryModalProps = {
    images: ImageObject[];
    onDeleteImage: (image: ImageObject) => Promise<void>;
    onClose: () => void;
};

export default function ProfileGalleryModal({
    images,
    onDeleteImage,
    onClose,
}: ProfileGalleryModalProps): JSX.Element {
    useBodyScrollLock();
    const [selectedImage, setSelectedImage] = useState<ImageObject | null>(null);
    const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleDeleteImage = async (
        image: ImageObject,
        imageId: string
    ): Promise<void> => {
        setDeletingImageId(imageId);
        setError('');

        try {
            await onDeleteImage(image);

            if (selectedImage?.id === image.id) {
                setSelectedImage(null);
            }
        } catch (deleteError: Error | any) {
            setError(
                deleteError?.message ?? 'Nao foi possivel remover a imagem da galeria'
            );
        } finally {
            setDeletingImageId(null);
        }
    };

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
                                const canDelete =
                                    typeof image.id === 'string' &&
                                    image.id.trim().length > 0;
                                const isDeleting = deletingImageId === imageId;

                                return (
                                    <div
                                        key={imageId}
                                        className="profile-gallery-picker__item"
                                    >
                                        <button
                                            type="button"
                                            className="profile-gallery-picker__item-preview"
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
                                        <button
                                            type="button"
                                            className="profile-gallery-picker__delete"
                                            onClick={() => {
                                                if (!canDelete || isDeleting) return;
                                                void handleDeleteImage(image, imageId);
                                            }}
                                            aria-label={`Remover ${
                                                image.title || `imagem ${index + 1}`
                                            } da galeria`}
                                            disabled={!canDelete || isDeleting}
                                        >
                                            <Image
                                                src={TrashSvg}
                                                alt=""
                                                width={14}
                                                height={14}
                                            />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {error ? (
                        <span className="font-XXS-regular profile-action-modal-error">
                            {error}
                        </span>
                    ) : null}
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
