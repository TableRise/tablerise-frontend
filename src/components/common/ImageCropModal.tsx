'use client';

import { useEffect, useRef, useState } from 'react';
import ReactCrop, { type PercentCrop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import '@/components/common/styles/ImageCropModal.css';
import {
    buildInitialCrop,
    createCroppedImageFile,
    IMAGE_CROP_CONFIG,
    percentCropToPixelCrop,
    type ImageUploadIntent,
} from '@/utils/imageCrop';

interface ImageCropModalProps {
    file: File;
    intent: ImageUploadIntent;
    onConfirm: (file: File) => Promise<void> | void;
    onUseOriginal: (file: File) => Promise<void> | void;
    onClose: () => void;
}

export default function ImageCropModal({
    file,
    intent,
    onConfirm,
    onUseOriginal,
    onClose,
}: ImageCropModalProps): JSX.Element {
    const config = IMAGE_CROP_CONFIG[intent];
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [crop, setCrop] = useState<PercentCrop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [file]);

    async function handleCropAndUse() {
        if (!imageRef.current || !completedCrop?.width || !completedCrop?.height) {
            setError('Selecione uma area da imagem para recortar.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const croppedFile = await createCroppedImageFile(
                imageRef.current,
                completedCrop,
                file
            );
            await onConfirm(croppedFile);
        } catch (err: Error | any) {
            setError(err?.message ?? 'Nao foi possivel recortar a imagem.');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleUseOriginal() {
        setSubmitting(true);
        setError('');

        try {
            await onUseOriginal(file);
        } catch (err: Error | any) {
            setError(err?.message ?? 'Nao foi possivel usar a imagem original.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            className="icm-backdrop"
            onClick={(event) => {
                event.stopPropagation();
                if (!submitting) onClose();
            }}
        >
            <div className="icm-modal" onClick={(event) => event.stopPropagation()}>
                <div className="icm-header">
                    <div className="icm-header-copy">
                        <h2 className="font-L-semibold icm-title">{config.title}</h2>
                        <p className="font-XS-regular icm-description">
                            {config.description}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="icm-close-btn"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Fechar recorte"
                    >
                        ×
                    </button>
                </div>

                <div className="icm-body">
                    {previewUrl ? (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => {
                                setCrop(percentCrop);
                                setError('');
                            }}
                            onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
                            aspect={config.aspect}
                            className="icm-cropper"
                            ruleOfThirds={Boolean(config.aspect)}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                ref={imageRef}
                                src={previewUrl}
                                alt="Prévia para recorte"
                                className="icm-image"
                                onLoad={(event) => {
                                    const nextCrop = buildInitialCrop(
                                        intent,
                                        event.currentTarget.naturalWidth,
                                        event.currentTarget.naturalHeight
                                    );
                                    setCrop(nextCrop);
                                    setCompletedCrop(
                                        nextCrop
                                            ? percentCropToPixelCrop(
                                                  nextCrop,
                                                  event.currentTarget.width,
                                                  event.currentTarget.height
                                              )
                                            : undefined
                                    );
                                }}
                            />
                        </ReactCrop>
                    ) : null}
                </div>

                {error ? <p className="font-XXS-regular icm-error">{error}</p> : null}

                <div className="icm-footer">
                    <button
                        type="button"
                        className="font-S-bold icm-btn-ghost"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="font-S-bold icm-btn-secondary"
                        onClick={handleUseOriginal}
                        disabled={submitting}
                    >
                        Usar original
                    </button>
                    <button
                        type="button"
                        className="button-L-fill font-S-bold icm-btn-primary bg-color-primary/default_900 text-color-greyScale/50"
                        onClick={handleCropAndUse}
                        disabled={submitting}
                    >
                        {submitting ? 'Processando...' : 'Recortar e usar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
