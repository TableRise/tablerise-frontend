'use client';
import { type ChangeEvent, useRef, useState } from 'react';
import ImageCropModal from '@/components/common/ImageCropModal';
import LoadingDots from '@/components/common/LoadingDots';
import type { ImageObject } from '@/types/shared/general';
import '@/components/match/styles/MatchImageHighlightModal.css';

interface MatchImageHighlightManagerModalProps {
    images: ImageObject[];
    highlightedImageId: string | null;
    isUploading: boolean;
    selectingImageId: string | null;
    onClose: () => void;
    onUpload: (file: File) => Promise<void>;
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
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState('');
    const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);

    const isBusy = isUploading || selectingImageId !== null;

    const uploadFile = async (file: File) => {
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

    return (
        <div className="mhim-overlay" onClick={onClose}>
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
                            onClick={() => inputRef.current?.click()}
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
                    onUseOriginal={uploadFile}
                    onClose={() => {
                        setPendingCropFile(null);
                        if (inputRef.current) {
                            inputRef.current.value = '';
                        }
                    }}
                />
            )}
        </div>
    );
}
