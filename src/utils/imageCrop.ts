import type { Area, Point } from 'react-easy-crop';

export type ImageUploadIntent =
    | 'profile-avatar'
    | 'character-portrait'
    | 'campaign-cover'
    | 'campaign-map'
    | 'match-highlight-image';

export interface ImageCropConfig {
    aspect?: number;
    title: string;
    description: string;
    defaultCropWidthPercent: number;
}

export interface ResolvedImageCropState {
    aspect: number;
    initialCrop: Point;
    initialZoom: number;
    initialCroppedAreaPercentages: Area;
}

export const IMAGE_CROP_MIN_ZOOM = 1;
export const IMAGE_CROP_MAX_ZOOM = 3;
export const IMAGE_CROP_ZOOM_STEP = 0.05;

const DEFAULT_INITIAL_CROP: Point = { x: 0, y: 0 };

export const IMAGE_CROP_CONFIG: Record<ImageUploadIntent, ImageCropConfig> = {
    'profile-avatar': {
        aspect: 1,
        title: 'Recortar foto de perfil',
        description: 'Ajuste a imagem antes de enviar ou use a original sem recorte.',
        defaultCropWidthPercent: 90,
    },
    'character-portrait': {
        aspect: 1,
        title: 'Recortar retrato do personagem',
        description: 'Ajuste a imagem antes de enviar ou use a original sem recorte.',
        defaultCropWidthPercent: 90,
    },
    'campaign-cover': {
        title: 'Recortar capa da campanha',
        description: 'Recorte a capa se desejar ou mantenha a imagem original.',
        defaultCropWidthPercent: 90,
    },
    'campaign-map': {
        title: 'Recortar mapa',
        description: 'Recorte o mapa se desejar.',
        defaultCropWidthPercent: 90,
    },
    'match-highlight-image': {
        title: 'Recortar imagem em destaque',
        description:
            'Recorte a imagem em destaque se desejar ou mantenha a imagem original.',
        defaultCropWidthPercent: 90,
    },
};

function sanitizeAspect(aspect: number): number {
    return Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
}

export function buildInitialCroppedAreaPercentages(
    defaultCropWidthPercent: number,
    aspect: number,
    mediaWidth: number,
    mediaHeight: number
): Area {
    const safeAspect = sanitizeAspect(aspect);
    const safeMediaWidth = Math.max(1, mediaWidth);
    const safeMediaHeight = Math.max(1, mediaHeight);
    const maxPercent = 100;
    let width = Math.min(maxPercent, Math.max(1, defaultCropWidthPercent));
    let height = (width * safeMediaWidth) / (safeAspect * safeMediaHeight);

    if (height > maxPercent) {
        height = maxPercent;
        width = (height * safeAspect * safeMediaHeight) / safeMediaWidth;
    }

    width = Math.min(maxPercent, Math.max(1, width));
    height = Math.min(maxPercent, Math.max(1, height));

    return {
        x: Math.max(0, (maxPercent - width) / 2),
        y: Math.max(0, (maxPercent - height) / 2),
        width,
        height,
    };
}

export function resolveImageCropState(
    intent: ImageUploadIntent,
    mediaWidth: number,
    mediaHeight: number
): ResolvedImageCropState {
    const config = IMAGE_CROP_CONFIG[intent];
    const aspect = sanitizeAspect(config.aspect ?? mediaWidth / mediaHeight);

    return {
        aspect,
        initialCrop: DEFAULT_INITIAL_CROP,
        initialZoom: IMAGE_CROP_MIN_ZOOM,
        initialCroppedAreaPercentages: buildInitialCroppedAreaPercentages(
            config.defaultCropWidthPercent,
            aspect,
            mediaWidth,
            mediaHeight
        ),
    };
}

export async function loadImageFromUrl(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new window.Image();

        image.onload = () => resolve(image);
        image.onerror = () => {
            reject(new Error('Não foi possivel carregar a imagem para recorte.'));
        };
        image.src = src;
    });
}

export async function createCroppedImageFile(
    image: HTMLImageElement,
    crop: Area,
    originalFile: File,
    targetWidth?: number,
    targetHeight?: number
): Promise<File> {
    const canvas = document.createElement('canvas');
    const croppedWidth = Math.max(1, Math.round(crop.width));
    const croppedHeight = Math.max(1, Math.round(crop.height));
    const outputWidth = Math.max(1, Math.round(targetWidth ?? croppedWidth));
    const outputHeight = Math.max(1, Math.round(targetHeight ?? croppedHeight));

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Não foi possivel preparar o recorte da imagem.');
    }

    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
        image,
        Math.round(crop.x),
        Math.round(crop.y),
        croppedWidth,
        croppedHeight,
        0,
        0,
        outputWidth,
        outputHeight
    );

    const mimeType = originalFile.type || 'image/png';
    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, mimeType, 0.92);
    });

    if (!blob) {
        throw new Error('Não foi possivel gerar a imagem recortada.');
    }

    return new File([blob], originalFile.name, {
        type: blob.type || mimeType,
        lastModified: Date.now(),
    });
}
