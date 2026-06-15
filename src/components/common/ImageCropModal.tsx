'use client';

import Cropper, { type Area, type Point } from 'react-easy-crop';
import { useEffect, useMemo, useState } from 'react';
import '@/components/common/styles/ImageCropModal.css';
import {
    createCroppedImageFile,
    IMAGE_CROP_CONFIG,
    IMAGE_CROP_MAX_ZOOM,
    IMAGE_CROP_MIN_ZOOM,
    IMAGE_CROP_ZOOM_STEP,
    loadImageFromUrl,
    resolveImageCropState,
    type ImageUploadIntent,
} from '@/utils/imageCrop';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

interface ImageCropModalProps {
    file: File;
    intent: ImageUploadIntent;
    onConfirm: (file: File) => Promise<void> | void;
    onClose: () => void;
}

const DEFAULT_CROP_POSITION: Point = { x: 0, y: 0 };

export default function ImageCropModal({
    file,
    intent,
    onConfirm,
    onClose,
}: ImageCropModalProps): JSX.Element {
    useBodyScrollLock();
    const config = IMAGE_CROP_CONFIG[intent];
    const [previewUrl, setPreviewUrl] = useState('');
    const [crop, setCrop] = useState<Point>(DEFAULT_CROP_POSITION);
    const [zoom, setZoom] = useState(IMAGE_CROP_MIN_ZOOM);
    const [resolvedAspect, setResolvedAspect] = useState<number | null>(null);
    const [initialCroppedAreaPercentages, setInitialCroppedAreaPercentages] = useState<
        Area | undefined
    >();
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const objectUrl = URL.createObjectURL(file);
        let active = true;

        setPreviewUrl(objectUrl);
        setResolvedAspect(null);
        setInitialCroppedAreaPercentages(undefined);
        setCroppedAreaPixels(null);
        setCrop(DEFAULT_CROP_POSITION);
        setZoom(IMAGE_CROP_MIN_ZOOM);
        setError('');

        void loadImageFromUrl(objectUrl)
            .then((image) => {
                if (!active) return;

                const nextCropState = resolveImageCropState(
                    intent,
                    image.naturalWidth,
                    image.naturalHeight
                );

                setResolvedAspect(nextCropState.aspect);
                setInitialCroppedAreaPercentages(
                    nextCropState.initialCroppedAreaPercentages
                );
                setCrop(nextCropState.initialCrop);
                setZoom(nextCropState.initialZoom);
            })
            .catch((err: Error) => {
                if (!active) return;

                setError(
                    err.message ?? 'Nao foi possivel carregar a imagem para recorte.'
                );
            });

        return () => {
            active = false;
            URL.revokeObjectURL(objectUrl);
        };
    }, [file, intent]);

    const cropperKey = useMemo(
        () =>
            previewUrl && resolvedAspect
                ? `${previewUrl}-${resolvedAspect.toFixed(4)}`
                : previewUrl || 'image-crop-modal',
        [previewUrl, resolvedAspect]
    );

    async function handleCropAndUse() {
        if (!previewUrl || !croppedAreaPixels?.width || !croppedAreaPixels?.height) {
            setError('Selecione uma area da imagem para recortar.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const image = await loadImageFromUrl(previewUrl);
            const croppedFile = await createCroppedImageFile(
                image,
                croppedAreaPixels,
                file
            );
            await onConfirm(croppedFile);
        } catch (err: Error | any) {
            setError(err?.message ?? 'Nao foi possivel recortar a imagem.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="icm-backdrop">
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
                        x
                    </button>
                </div>

                <div className="icm-body">
                    {previewUrl && resolvedAspect ? (
                        <>
                            <div className="icm-crop-stage">
                                <Cropper
                                    key={cropperKey}
                                    image={previewUrl}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={0}
                                    aspect={resolvedAspect}
                                    minZoom={IMAGE_CROP_MIN_ZOOM}
                                    maxZoom={IMAGE_CROP_MAX_ZOOM}
                                    cropShape="rect"
                                    showGrid={Boolean(config.aspect)}
                                    restrictPosition
                                    initialCroppedAreaPercentages={
                                        initialCroppedAreaPercentages
                                    }
                                    onCropChange={(nextCrop) => {
                                        setCrop(nextCrop);
                                        setError('');
                                    }}
                                    onZoomChange={(nextZoom) => {
                                        setZoom(nextZoom);
                                        setError('');
                                    }}
                                    onCropComplete={(_, nextCroppedAreaPixels) =>
                                        setCroppedAreaPixels(nextCroppedAreaPixels)
                                    }
                                    classes={{
                                        containerClassName: 'icm-cropper-container',
                                        mediaClassName: 'icm-cropper-media',
                                        cropAreaClassName: 'icm-cropper-area',
                                    }}
                                    mediaProps={{
                                        alt: 'Previa para recorte',
                                    }}
                                />
                            </div>

                            <div className="icm-zoom-panel">
                                <div className="icm-zoom-copy">
                                    <span className="font-XS-bold">Zoom</span>
                                    <span className="font-XXS-regular">
                                        {Math.round(zoom * 100)}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={IMAGE_CROP_MIN_ZOOM}
                                    max={IMAGE_CROP_MAX_ZOOM}
                                    step={IMAGE_CROP_ZOOM_STEP}
                                    value={zoom}
                                    onChange={(event) => {
                                        setZoom(Number(event.target.value));
                                        setError('');
                                    }}
                                    className="icm-zoom-slider"
                                    aria-label="Ajustar zoom da imagem"
                                    disabled={submitting}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="icm-loading-state font-XS-regular">
                            {error
                                ? 'Nao foi possivel preparar a imagem para recorte.'
                                : 'Carregando imagem...'}
                        </div>
                    )}
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
                        className="button-L-fill font-S-bold icm-btn-primary bg-color-primary/default_900 text-color-greyScale/50"
                        onClick={handleCropAndUse}
                        disabled={submitting || !resolvedAspect}
                    >
                        {submitting ? 'Processando...' : 'Recortar e usar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
