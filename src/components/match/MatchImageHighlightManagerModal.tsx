'use client';
import { type ChangeEvent, useRef, useState } from 'react';
import ImageCropModal from '@/components/common/ImageCropModal';
import LoadingDots from '@/components/common/LoadingDots';
import ImageSourceChoiceModal from '@/components/common/ImageSourceChoiceModal';
import UserGalleryPickerModal from '@/components/common/UserGalleryPickerModal';
import { useStoredUser, normalizeStoredUserId } from '@/hooks/useStoredUser';
import { useUserGallery } from '@/hooks/useUserGallery';
import type { ImageObject } from '@/types/shared/general';
import type { UploadImageValue } from '@/utils/imageUploadPayload';
import '@/components/match/styles/MatchImageHighlightModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

interface MatchImageHighlightManagerModalProps {
    images: ImageObject[];
    highlightedImageId: string | null;
    isUploading: boolean;
    selectingImageId: string | null;
    onClose: () => void;
    onUpload: (file: UploadImageValue) => Promise<void>;
    onSelect: (imageId: string, remove?: boolean) => Promise<void>;
}

export default function MatchImageHighlightManagerModal({
    images,
    highlightedImageId,
    isUploading,
    selectingImageId,
    onClose,
    onUpload,
    onSelect,
}: MatchImageHighlightManagerModalProps): JSX.Element {
    useBodyScrollLock();
    const { storedUser } = useStoredUser();
    const currentUserId = normalizeStoredUserId(storedUser);
    const { galleryImages, loadingGallery } = useUserGallery(currentUserId);
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState('');
    const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);
    const [sourceChoiceOpen, setSourceChoiceOpen] = useState(false);
    const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);

    const isBusy = isUploading || selectingImageId !== null;

    const uploadFile = async (file: UploadImageValue) => {
        setError('');

        try {
            await onUpload(file);
            setPendingCropFile(null);
        } catch (uploadError: any) {
            setError(uploadError?.message ?? 'Erro ao enviar imagem.');
            throw uploadError;
        } finally {
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError('');
        setPendingCropFile(file);
    };

    const handleSelectImage = async (imageId: string, remove?: boolean) => {
        setError('');

        try {
            await onSelect(imageId, remove);
        } catch (selectError: any) {
            setError(
                selectError?.message ??
                    (remove
                        ? 'Erro ao remover imagem destacada.'
                        : 'Erro ao destacar imagem.')
            );
        }
    };

    const handleRequestUpload = () => {
        if (isBusy) return;
        if (loadingGallery) {
            setError('A galeria ainda esta carregando.');
            return;
        }

        if (galleryImages.length > 0) {
            setSourceChoiceOpen(true);
            return;
        }

        inputRef.current?.click();
    };

    return (
        <div className="mhim-overlay">
            <div className="mhim-modal" onClick={(event) => event.stopPropagation()}>
                <div className="mhim-header">
                    <div>
                        <h2 className="font-L-bold mhim-title">Imagem em destaque</h2>
                        <p className="font-XXS-regular mhim-subtitle">
                            Envie uma imagem e selecione qual deve aparecer para todos os
                            jogadores.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="mhim-close"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        X
                    </button>
                </div>

                <div className="mhim-body">
                    <div className="mhim-actions">
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            className="mhim-upload-btn font-XS-bold"
                            onClick={handleRequestUpload}
                            disabled={isBusy}
                        >
                            {isUploading ? (
                                <LoadingDots label="Enviando imagem" />
                            ) : (
                                'Enviar nova imagem'
                            )}
                        </button>
                    </div>

                    <div className="mhim-gallery">
                        <div className="mhim-gallery-header">
                            <span className="font-S-bold mhim-gallery-title">
                                Galeria
                            </span>
                            <span className="font-XXS-regular mhim-gallery-hint">
                                Clique em uma imagem para destacar no match.
                            </span>
                        </div>

                        {images.length === 0 ? (
                            <span className="font-XS-regular mhim-empty">
                                Nenhuma imagem enviada para esta partida.
                            </span>
                        ) : (
                            <div className="mhim-grid">
                                {images.map((image, index) => {
                                    const imageId = image.id ?? image.link ?? `${index}`;
                                    const isActive = highlightedImageId === image.id;
                                    const isSelecting = selectingImageId === image.id;

                                    return (
                                        <button
                                            key={imageId}
                                            type="button"
                                            className={`mhim-item${
                                                isActive ? ' mhim-item--active' : ''
                                            }`}
                                            onClick={() =>
                                                image.id
                                                    ? handleSelectImage(
                                                          image.id,
                                                          isActive
                                                      )
                                                    : undefined
                                            }
                                            disabled={isBusy || !image.id}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={image.link}
                                                alt={image.title || `Imagem ${index + 1}`}
                                                className="mhim-item-image"
                                            />
                                            <div className="mhim-item-footer">
                                                <span className="font-XXS-bold mhim-item-title">
                                                    {image.title || `Imagem ${index + 1}`}
                                                </span>
                                                <span className="font-XXS-bold mhim-item-state">
                                                    {isSelecting
                                                        ? 'Selecionando...'
                                                        : isActive
                                                        ? 'Remover'
                                                        : 'Selecionar'}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {error && <span className="font-XS-regular mhim-error">{error}</span>}
                </div>
            </div>

            {pendingCropFile && (
                <ImageCropModal
                    file={pendingCropFile}
                    intent="match-highlight-image"
                    onConfirm={uploadFile}
                    onClose={() => {
                        setPendingCropFile(null);
                        if (inputRef.current) {
                            inputRef.current.value = '';
                        }
                    }}
                />
            )}

            {sourceChoiceOpen ? (
                <ImageSourceChoiceModal
                    title="Selecionar imagem"
                    description="Escolha uma imagem local ou uma imagem salva na sua galeria."
                    onClose={() => setSourceChoiceOpen(false)}
                    onSelectLocal={() => {
                        setSourceChoiceOpen(false);
                        inputRef.current?.click();
                    }}
                    onSelectGallery={() => {
                        setSourceChoiceOpen(false);
                        setGalleryPickerOpen(true);
                    }}
                />
            ) : null}

            {galleryPickerOpen ? (
                <UserGalleryPickerModal
                    title="Selecionar imagem da galeria"
                    description="Escolha uma imagem salva na sua galeria para enviar ao match."
                    images={galleryImages}
                    onClose={() => setGalleryPickerOpen(false)}
                    onSelect={(image) => {
                        setGalleryPickerOpen(false);
                        void uploadFile(image).catch(() => undefined);
                    }}
                />
            ) : null}
        </div>
    );
}
